import Auth from './auth.js';
import CSTaxonomy from './taxonomy-cs.js';
import { translations, Translations } from './translations.js';

/**
 * Aegis Board - Incident Management System
 * Version: 2.0.0
 * 
 * Sistema de gestión de incidentes de ciberseguridad
 * Compatible con NIST 800-61, ISO/IEC 27035 y MITRE ATT&CK
 */

const IncidentManager = {
    // Configuración
    config: {
        storageKey: 'aegisIncidents',
        defaultArea: 'CS'
    },

    // Estado
    state: {
        incidents: [],
        currentIncident: null,
        filters: {
            status: '',
            criticality: '',
            type: '',
            search: ''
        }
    },

    /**
     * Inicializar sistema
     */
    init: function () {
        this.loadIncidents();
        this.setupEventListeners();
        this.setupTheme(); // Aplicar tema al iniciar
        this.renderIncidents();
        this.updateStats();
        this.populateFormSelects();
    },

    /**
     * Cargar incidentes desde localStorage
     */
    loadIncidents: function () {
        try {
            const data = localStorage.getItem(this.config.storageKey);
            this.state.incidents = data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading incidents:', e);
            this.state.incidents = [];
        }
    },

    /**
     * Guardar incidentes en localStorage
     */
    saveIncidents: function () {
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.state.incidents));
        } catch (e) {
            console.error('Error saving incidents:', e);
            this.showAlert('Error al guardar incidentes', 'danger');
        }
    },

    /**
     * Crear nuevo incidente
     */
    createIncident: function (data) {
        const currentUser = Auth.getCurrentUser();
        const timestamp = new Date().toISOString();

        // Generar código automático
        const code = CSTaxonomy.generateIncidentCode(data.type, data.area);

        // Calcular prioridad y criticidad automáticamente
        const priority = CSTaxonomy.getPriority(data.sgsi.impact, data.sgsi.urgency);
        const incident = {
            id: this.generateId(),
            code: code,
            detection: {
                timestamp: timestamp,
                channel: data.channel,
                reportedBy: data.reportedBy || currentUser?.name || 'Sistema'
            },
            description: data.description,
            affected: {
                ip: data.ip || '',
                hostname: data.hostname || ''
            },
            classification: {
                type: data.type,
                typeLabel: CSTaxonomy.getIncidentTypeLabel(data.type),
                criticality: priority, // <-- criticidad calculada
                status: data.status || 'Open',
                confidence: data.confidence || 'MEDIUM',
                area: data.area || ''
            },
            sgsi: {
                impact: data.sgsi.impact,
                urgency: data.sgsi.urgency,
                priority: priority,
                category: data.sgsi.category,
                subcategory: data.sgsi.subcategory || '',
                asset: data.sgsi.asset || ''
            },
            assignment: {
                containment: {
                    user: data.assignment?.containment?.user || '',
                    sla: '1h',
                    assigned: data.assignment?.containment?.user ? timestamp : null
                },
                analysis: {
                    user: data.assignment?.analysis?.user || '',
                    sla: '2h',
                    assigned: data.assignment?.analysis?.user ? timestamp : null
                },
                remediation: {
                    user: data.assignment?.remediation?.user || '',
                    sla: '4h',
                    assigned: data.assignment?.remediation?.user ? timestamp : null
                }
            },
            nistPhase: data.nistPhase || '', // Por defecto vacío si no hay selección
            mitreTactic: data.mitreTactic || '', // Usa la táctica del formulario
            iocs: {
                ips: data.iocs?.ips || [],
                hashes: data.iocs?.hashes || [],
                domains: data.iocs?.domains || [],
                artifacts: data.iocs?.artifacts || []
            },
            evidence: data.evidence || [],
            actions: [],
            timeline: {
                created: timestamp,
                updated: timestamp,
                closed: null
            },
            createdBy: currentUser?.name || 'Sistema'
        };

        this.state.incidents.push(incident);
        this.saveIncidents();
        this.renderIncidents();
        this.updateStats();

        return incident;
    },

    /**
     * Actualizar incidente existente
     */
    updateIncident: function (id, updates) {
        const index = this.state.incidents.findIndex(inc => inc.id === id);
        if (index === -1) {
            this.showAlert('Incidente no encontrado', 'danger');
            return false;
        }

        // Actualizar timestamp
        updates.timeline = {
            ...this.state.incidents[index].timeline,
            updated: new Date().toISOString()
        };

        // Si cambia a estado "Closed", registrar fecha de cierre
        if (updates.classification?.status === 'Closed' &&
            this.state.incidents[index].classification.status !== 'Closed') {
            updates.timeline.closed = new Date().toISOString();
        }

        // Recalcular prioridad y criticidad si cambian impacto/urgencia
        if (updates.sgsi?.impact || updates.sgsi?.urgency) {
            const currentSgsi = this.state.incidents[index].sgsi;
            const newImpact = updates.sgsi.impact || currentSgsi.impact;
            const newUrgency = updates.sgsi.urgency || currentSgsi.urgency;
            updates.sgsi = updates.sgsi || {};
            const newPriority = CSTaxonomy.getPriority(newImpact, newUrgency);
            updates.sgsi.priority = newPriority;
            if (!updates.classification) updates.classification = {};
            updates.classification.criticality = newPriority;
        }

        // Map flat formData values into the nested incident structure before merging
        const mappedUpdates = {
            description: updates.description,
            nistPhase: updates.nistPhase,
            mitreTactic: updates.mitreTactic,
            iocs: updates.iocs,
            sgsi: updates.sgsi,
            timeline: updates.timeline,
            containment: updates.containment,
            analysis: updates.analysis,
            remediation: updates.remediation,
            lessons: updates.lessons,
        };

        if (updates.type !== undefined || updates.status !== undefined || updates.area !== undefined || updates.confidence !== undefined) {
            mappedUpdates.classification = {
                ...(updates.type !== undefined && { type: updates.type, typeLabel: CSTaxonomy.getIncidentTypeLabel(updates.type) }),
                ...(updates.status !== undefined && { status: updates.status }),
                ...(updates.area !== undefined && { area: updates.area }),
                ...(updates.confidence !== undefined && { confidence: updates.confidence }),
                ...(updates.classification?.criticality !== undefined && { criticality: updates.classification.criticality })
            };
        }

        if (updates.ip !== undefined || updates.hostname !== undefined) {
            mappedUpdates.affected = {
                ...(updates.ip !== undefined && { ip: updates.ip }),
                ...(updates.hostname !== undefined && { hostname: updates.hostname })
            };
        }

        if (updates.channel !== undefined || updates.reportedBy !== undefined) {
            mappedUpdates.detection = {
                ...(updates.channel !== undefined && { channel: updates.channel }),
                ...(updates.reportedBy !== undefined && { reportedBy: updates.reportedBy })
            };
        }

        // Merge updates using the mapped structure
        this.state.incidents[index] = this.deepMerge(this.state.incidents[index], mappedUpdates);

        this.saveIncidents();
        this.renderIncidents();
        this.updateStats();

        return true;
    },

    /**
     * Eliminar incidente
     */
    deleteIncident: function (id) {
        const lang = Translations?.currentLanguage || localStorage.getItem("osintLanguage") || "es";
        const title = lang === 'en' ? 'Are you sure?' : '¿Estás seguro?';
        const text = translations[lang]["CONFIRM_DELETE_INCIDENT"] || '¿Estás seguro de eliminar este incidente? Esta acción no se puede deshacer.';
        const confirmBtn = lang === 'en' ? 'Yes, delete' : 'Sí, eliminar';

        this.confirmDelete(title, text, confirmBtn, () => {
            this.state.incidents = this.state.incidents.filter(inc => inc.id !== id);
            this.saveIncidents();
            this.renderIncidents();
            this.updateStats();

            // Pequeña espera para que la confirmación se cierre totalmente
            setTimeout(() => {
                Swal.fire({
                    title: lang === 'en' ? 'Deleted!' : '¡Eliminado!',
                    text: translations[lang]["INCIDENT_DELETED"] || 'Incidente eliminado correctamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: 'var(--modal-bg)',
                    color: 'var(--text)',
                    showClass: {
                        popup: 'premium-swal-show'
                    },
                    hideClass: {
                        popup: 'premium-swal-hide'
                    },
                    customClass: {
                        popup: 'premium-swal-popup',
                        title: 'premium-swal-title'
                    }
                });
            }, 300);
        });

        return true;
    },

    /**
     * Agregar acción al incidente
     */
    addAction: function (incidentId, action) {
        const incident = this.state.incidents.find(inc => inc.id === incidentId);
        if (!incident) return false;

        const currentUser = Auth.getCurrentUser();
        const newAction = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            task: action.task,
            responsible: action.responsible || currentUser?.name || 'Sistema',
            result: action.result || ''
        };

        incident.actions.push(newAction);
        incident.timeline.updated = new Date().toISOString();

        this.saveIncidents();
        return newAction;
    },

    /**
     * Obtener incidentes filtrados
     */
    getFilteredIncidents: function () {
        let filtered = [...this.state.incidents];

        // Filtro por estado
        if (this.state.filters.status) {
            filtered = filtered.filter(inc =>
                inc.classification.status === this.state.filters.status
            );
        }

        // Filtro por criticidad
        if (this.state.filters.criticality) {
            filtered = filtered.filter(inc =>
                inc.classification.criticality === this.state.filters.criticality
            );
        }

        // Filtro por tipo
        if (this.state.filters.type) {
            filtered = filtered.filter(inc =>
                inc.classification.type === this.state.filters.type
            );
        }

        // Búsqueda por texto
        if (this.state.filters.search) {
            const searchLower = this.state.filters.search.toLowerCase();
            filtered = filtered.filter(inc =>
                inc.code.toLowerCase().includes(searchLower) ||
                inc.description.toLowerCase().includes(searchLower) ||
                inc.affected.ip.toLowerCase().includes(searchLower) ||
                inc.affected.hostname.toLowerCase().includes(searchLower)
            );
        }

        // Ordenar por fecha (más recientes primero)
        filtered.sort((a, b) =>
            new Date(b.detection.timestamp) - new Date(a.detection.timestamp)
        );

        return filtered;
    },

    /**
     * Renderizar tabla de incidentes
     */
    renderIncidents: function () {
        const tbody = document.getElementById('incidentsTableBody');
        if (!tbody) return;

        const incidents = this.getFilteredIncidents();

        if (incidents.length === 0) {
            tbody.innerHTML = '';
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 8;
            td.className = 'text-center text-muted py-5';

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '48');
            svg.setAttribute('height', '48');
            svg.setAttribute('fill', 'currentColor');
            svg.setAttribute('class', 'bi bi-inbox mb-3');
            svg.setAttribute('viewBox', '0 0 16 16');
            svg.innerHTML = '<path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm9.954 5H10.45a2.5 2.5 0 0 1-4.9 0H1.066l.32 2.562a.5.5 0 0 0 .497.438h12.234a.5.5 0 0 0 .496-.438L14.933 9zM3.809 3.563A1.5 1.5 0 0 1 4.981 3h6.038a1.5 1.5 0 0 1 1.172.563l3.7 4.625a.5.5 0 0 1 .105.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z"/>';

            const p = document.createElement('p');
            p.className = 'mb-0';
            p.setAttribute('data-i18n', 'NO_INCIDENTS');
            p.textContent = t('NO_INCIDENTS', lang);

            td.appendChild(svg);
            td.appendChild(p);
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        tbody.innerHTML = incidents.map(incident => {
            const lang = Translations?.currentLanguage || localStorage.getItem("osintLanguage") || "es";
            const statusBadge = CSTaxonomy.getStatusBadge(incident.classification.status, lang);
            const critColor = CSTaxonomy.getCriticalityColor(incident.classification.criticality);
            const critLabel = CSTaxonomy.getCriticalityLabel(incident.classification.criticality, lang);
            const typeLabel = CSTaxonomy.getIncidentTypeLabel(incident.classification.type, lang);

            const statusColorClass = incident.classification.status.toLowerCase().replace(' ', '-');

            return `
                    <tr class="align-middle">
                        <td class="fw-bold text-primary" style="font-family: monospace;">${incident.code}</td>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <span class="status-dot-pulse bg-${statusColorClass}"></span>
                                ${statusBadge.label}
                            </div>
                        </td>
                        <td class="text-center">
                             <span class="status-dot-pulse bg-${critColor}"></span>
                        </td>
                        <td>
                            <span class="badge border border-${critColor} text-${critColor} bg-${critColor}-lt" style="border-radius: 50px !important; padding: 0.4rem 1rem;">
                                ${critLabel}
                            </span>
                        </td>
                        <td>
                            <span class="text-body fw-medium">${typeLabel}</span>
                        </td>
                        <td>
                            <div class="text-truncate" style="max-width: 250px;" title="${incident.description}">
                                ${incident.description}
                            </div>
                        </td>
                        <td>
                            <span class="font-monospace small text-body">
                                ${incident.affected.ip || incident.affected.hostname || '<span class="text-muted">-</span>'}
                            </span>
                        </td>
                        <td><span class="text-body">${incident.detection.reportedBy}</span></td>
                        <td>
                            <div class="d-flex gap-2">
                                <button class="btn-action-pill btn-edit" onclick="event.stopPropagation(); IncidentManager.editIncident('${incident.id}')" title="Editar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button class="btn-action-pill btn-delete" onclick="event.stopPropagation(); IncidentManager.deleteIncident('${incident.id}')" title="Eliminar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
            `;
        }).join('');
    },

    /**
     * Actualizar estadísticas
     */
    updateStats: function () {
        const stats = {
            total: this.state.incidents.length,
            open: this.state.incidents.filter(i => i.classification.status === 'Open').length,
            investigating: this.state.incidents.filter(i => i.classification.status === 'Investigating').length,
            critical: this.state.incidents.filter(i => i.sgsi.priority === 'Critical').length
        };

        const totalEl = document.getElementById('totalIncidents');
        const openEl = document.getElementById('openIncidents');
        const investEl = document.getElementById('investigatingIncidents');
        const critEl = document.getElementById('criticalIncidents');

        if (totalEl) totalEl.textContent = stats.total;
        if (openEl) openEl.textContent = stats.open;
        if (investEl) investEl.textContent = stats.investigating;
        if (critEl) critEl.textContent = stats.critical;
    },

    /**
     * Abrir modal para nuevo incidente
     */
    openNewIncidentModal: function () {
        this.state.currentIncident = null;
        this.populateFormSelects();
        document.getElementById('incidentForm')?.reset();
        document.getElementById('incidentModalLabel').textContent = translations[Translations.currentLanguage]['NEW_INCIDENT'] || 'Nuevo Incidente';

        // Mostrar modal (Bootstrap)
        const modal = new bootstrap.Modal(document.getElementById('incidentModal'));
        modal.show();
    },

    /**
     * Ver detalles del incidente
     */
    viewIncident: function (id) {
        const incident = this.state.incidents.find(inc => inc.id === id);
        if (!incident) return;

        // Implementar vista detallada (puede ser un modal o página separada)
        console.log('View incident:', incident);
        this.editIncident(id); // Por ahora, redirige a editar
    },

    /**
     * Editar incidente
     */
    editIncident: function (id) {
        const incident = this.state.incidents.find(inc => inc.id === id);
        if (!incident) return;

        this.state.currentIncident = incident;
        this.populateForm(incident);

        const modalTitle = document.getElementById('incidentModalLabel');
        if (modalTitle) {
            const lang = Translations?.currentLanguage || localStorage.getItem("osintLanguage") || "es";
            const editText = translations[lang]["EDIT_INCIDENT_CODE"] || "Editar Incidente:";
            modalTitle.textContent = `${editText} ${incident.code}`;
        }

        const modalElement = document.getElementById('incidentModal');
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
    },

    /**
     * Poblar selects del formulario
     */
    populateFormSelects: function () {
        console.log('Poblando selects del formulario...');
        const lang = Translations?.currentLanguage || localStorage.getItem("osintLanguage") || "es";
        const selectPlaceholder = translations[lang]["SELECT_PLACEHOLDER"] || "-- Seleccionar --";

        // 1. Tipos de incidentes
        const typeSelect = document.getElementById('incidentType');
        if (typeSelect) {
            typeSelect.innerHTML = '';
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = selectPlaceholder;
            typeSelect.appendChild(defaultOpt);

            CSTaxonomy.incidentTypes.forEach(type => {
                const opt = document.createElement('option');
                opt.value = type.code;
                opt.textContent = lang === 'en' ? type.labelEN : type.label;
                typeSelect.appendChild(opt);
            });
            console.log('✓ Tipos de incidente poblados:', CSTaxonomy.incidentTypes.length);
        }

        // 2. Áreas organizacionales
        const areaSelect = document.getElementById('incidentArea');
        if (areaSelect) {
            areaSelect.innerHTML = `<option value="">${selectPlaceholder}</option>` +
                CSTaxonomy.areas.map(area =>
                    `<option value="${area.code}">${area.label}</option>`
                ).join('');
            console.log('✓ Áreas pobladas:', CSTaxonomy.areas.length);
        }

        // 3. Canales de detección
        const channelSelect = document.getElementById('incidentDetectionChannel');
        if (channelSelect) {
            channelSelect.innerHTML = `<option value="">${selectPlaceholder}</option>` +
                CSTaxonomy.detectionChannels.map(channel =>
                    `<option value="${channel.value}">${lang === 'en' ? channel.labelEN : channel.label}</option>`
                ).join('');
            console.log('✓ Canales de detección poblados:', CSTaxonomy.detectionChannels.length);
        }

        // 4. Estados
        const statusSelect = document.getElementById('incidentStatus');
        if (statusSelect) {
            statusSelect.innerHTML = `<option value="">${selectPlaceholder}</option>` +
                CSTaxonomy.statuses.map(status =>
                    `<option value="${status.value}">${lang === 'en' ? status.labelEN : status.label}</option>`
                ).join('');
            console.log('✓ Estados poblados:', CSTaxonomy.statuses.length);
        }

        // 5. Fase NIST
        const nistSelect = document.getElementById('incidentNistPhase');
        if (nistSelect && CSTaxonomy.nistPhases) {
            nistSelect.innerHTML = `<option value="">${selectPlaceholder}</option>` +
                CSTaxonomy.nistPhases.map(phase =>
                    `<option value="${phase.id}">${lang === 'en' ? phase.labelEN : phase.label}</option>`
                ).join('');
            console.log('✓ Fases NIST pobladas:', CSTaxonomy.nistPhases.length);
        }

        // 6. Táctica MITRE
        const mitreSelect = document.getElementById('incidentMitreTactic');
        if (mitreSelect && CSTaxonomy.mitreAttack) {
            mitreSelect.innerHTML = `<option value="">${selectPlaceholder}</option>` +
                CSTaxonomy.mitreAttack.map(tactic =>
                    `<option value="${tactic.id}">${lang === 'en' ? tactic.labelEN : tactic.label}</option>`
                ).join('');
            console.log('✓ Tácticas MITRE pobladas:', CSTaxonomy.mitreAttack.length);
        }

        // 7. Categoría SGSI
        const sgsiCatSelect = document.getElementById('incidentSgsiCategory');
        if (sgsiCatSelect && CSTaxonomy.sgsiCategories) {
            sgsiCatSelect.innerHTML = `<option value="">${selectPlaceholder}</option>` +
                CSTaxonomy.sgsiCategories.map(cat =>
                    `<option value="${cat.category}">${lang === 'en' ? cat.categoryEN : cat.category}</option>`
                ).join('');
            console.log('✓ Categorías SGSI pobladas:', CSTaxonomy.sgsiCategories.length);
        }

        console.log('Selects poblados correctamente');
    },

    /**
     * Poblar formulario con datos del incidente
     */
    populateForm: function (incident) {
        // Información básica
        const typeEl = document.getElementById('incidentType');
        if (typeEl) typeEl.value = incident.classification.type;

        const areaEl = document.getElementById('incidentArea');
        if (areaEl) {
            areaEl.value = incident.classification?.area || (incident.code ? incident.code.split('-')[2] : '');
        }

        const channelEl = document.getElementById('incidentDetectionChannel');
        if (channelEl) channelEl.value = incident.detection.channel;

        const descEl = document.getElementById('incidentDescription');
        if (descEl) descEl.value = incident.description || '';

        const ipEl = document.getElementById('incidentAffectedIP');
        if (ipEl) ipEl.value = incident.affected.ip || '';

        const hostEl = document.getElementById('incidentAffectedHost');
        if (hostEl) hostEl.value = incident.affected.hostname || '';

        const reporterEl = document.getElementById('incidentReporter');
        if (reporterEl) reporterEl.value = incident.detection.reportedBy || '';

        const statusEl = document.getElementById('incidentStatus');
        if (statusEl) statusEl.value = incident.classification.status;

        const confEl = document.getElementById('incidentConfidence');
        if (confEl) confEl.value = incident.classification.confidence || 'MEDIUM';

        // SGSI
        const impactEl = document.getElementById('incidentImpact');
        if (impactEl) impactEl.value = incident.sgsi.impact;

        const urgencyEl = document.getElementById('incidentUrgency');
        if (urgencyEl) urgencyEl.value = incident.sgsi.urgency;

        const sgsiCatEl = document.getElementById('incidentSgsiCategory');
        if (sgsiCatEl) sgsiCatEl.value = incident.sgsi.category || '';

        const sgsiSubcatEl = document.getElementById('incidentSgsiSubcategory');
        if (sgsiSubcatEl) sgsiSubcatEl.value = incident.sgsi.subcategory || '';

        const assetEl = document.getElementById('incidentAsset');
        if (assetEl) assetEl.value = incident.sgsi.asset || '';

        // NIST y MITRE
        const nistEl = document.getElementById('incidentNistPhase');
        if (nistEl) nistEl.value = incident.nistPhase || '';

        const mitreEl = document.getElementById('incidentMitreTactic');
        if (mitreEl) mitreEl.value = incident.mitreTactic || '';

        // IoCs
        const ipsEl = document.getElementById('incidentMaliciousIPs');
        if (ipsEl && incident.iocs?.ips) ipsEl.value = incident.iocs.ips.join(', ');

        const hashesEl = document.getElementById('incidentFileHashes');
        if (hashesEl && incident.iocs?.hashes) hashesEl.value = incident.iocs.hashes.join('\n');

        const domainsEl = document.getElementById('incidentSuspiciousDomains');
        if (domainsEl && incident.iocs?.domains) domainsEl.value = incident.iocs.domains.join(', ');

        // Acciones
        const containmentEl = document.getElementById('incidentContainment');
        if (containmentEl) containmentEl.value = incident.containment || '';

        const analysisEl = document.getElementById('incidentAnalysis');
        if (analysisEl) analysisEl.value = incident.analysis || '';

        const remediationEl = document.getElementById('incidentRemediation');
        if (remediationEl) remediationEl.value = incident.remediation || '';

        const lessonsEl = document.getElementById('incidentLessons');
        if (lessonsEl) lessonsEl.value = incident.lessons || '';

        // Actualizar prioridad calculada
        this.updateCalculatedPriority();
    },

    /**
     * Guardar incidente desde formulario
     */
    saveIncidentFromForm: function (event) {
        event.preventDefault();

        const form = document.getElementById('incidentForm');
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = {
            type: document.getElementById('incidentType').value,
            area: document.getElementById('incidentArea').value,
            channel: document.getElementById('incidentDetectionChannel').value,
            description: document.getElementById('incidentDescription').value,
            ip: document.getElementById('incidentAffectedIP').value,
            hostname: document.getElementById('incidentAffectedHost').value,
            reportedBy: document.getElementById('incidentReporter').value,
            status: document.getElementById('incidentStatus').value,
            confidence: document.getElementById('incidentConfidence')?.value || 'MEDIUM',
            sgsi: {
                impact: document.getElementById('incidentImpact').value,
                urgency: document.getElementById('incidentUrgency').value,
                category: document.getElementById('incidentSgsiCategory').value,
                subcategory: document.getElementById('incidentSgsiSubcategory')?.value || '',
                asset: document.getElementById('incidentAsset')?.value || ''
            },
            nistPhase: document.getElementById('incidentNistPhase')?.value || '',
            mitreTactic: document.getElementById('incidentMitreTactic')?.value || '',
            assignedTo: document.getElementById('incidentAssignedTo')?.value || '',
            sla: document.getElementById('incidentSLA')?.value || '',
            estimatedResolution: document.getElementById('incidentEstimatedResolution')?.value || '',
            iocs: {
                ips: (document.getElementById('incidentMaliciousIPs')?.value || '').split(',').map(s => s.trim()).filter(s => s),
                hashes: (document.getElementById('incidentFileHashes')?.value || '').split('\n').map(s => s.trim()).filter(s => s),
                domains: (document.getElementById('incidentSuspiciousDomains')?.value || '').split(',').map(s => s.trim()).filter(s => s),
                artifacts: document.getElementById('incidentArtifacts')?.value || ''
            },
            containment: document.getElementById('incidentContainment')?.value || '',
            analysis: document.getElementById('incidentAnalysis')?.value || '',
            remediation: document.getElementById('incidentRemediation')?.value || '',
            lessons: document.getElementById('incidentLessons')?.value || ''
        };

        const isUpdate = !!this.state.currentIncident;

        if (isUpdate) {
            // Actualizar pasando propiedades planas para que updateIncident las mapee correctamente
            this.updateIncident(this.state.currentIncident.id, {
                description: formData.description,
                ip: formData.ip,
                hostname: formData.hostname,
                channel: formData.channel,
                reportedBy: formData.reportedBy,
                type: formData.type,
                area: formData.area,
                status: formData.status,
                confidence: formData.confidence,
                sgsi: formData.sgsi,
                nistPhase: formData.nistPhase,
                mitreTactic: formData.mitreTactic,
                iocs: formData.iocs,
                containment: formData.containment,
                analysis: formData.analysis,
                remediation: formData.remediation,
                lessons: formData.lessons
            });
        } else {
            // Crear nuevo
            this.createIncident(formData);
        }

        // Cerrar modal y resetear
        const modalElement = document.getElementById('incidentModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);

        const showSuccess = () => {
            // isUpdate ya está capturado del scope superior
            Swal.fire({
                title: isUpdate ? '¡Actualizado!' : '¡Creado!',
                text: isUpdate ? 'Incidente actualizado correctamente' : 'Incidente creado correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: 'var(--modal-bg)',
                color: 'var(--text)',
                showClass: {
                    popup: 'premium-swal-show'
                },
                hideClass: {
                    popup: 'premium-swal-hide'
                },
                customClass: {
                    popup: 'premium-swal-popup',
                    title: 'premium-swal-title'
                }
            });
        };

        if (modalInstance) {
            modalInstance.hide();
            // Esperar a que el modal de Bootstrap se oculte completamente para evitar conflictos
            setTimeout(showSuccess, 400);
        } else {
            showSuccess();
        }

        // Resetear el formulario y el estado
        this.state.currentIncident = null;
        document.getElementById('incidentForm')?.reset();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: function () {
        // Poblar selects al inicio
        this.populateFormSelects();
        this.populateFilters();

        // Filtros
        document.getElementById('filterStatus')?.addEventListener('change', (e) => {
            this.state.filters.status = e.target.value;
            this.renderIncidents();
        });

        document.getElementById('filterCriticality')?.addEventListener('change', (e) => {
            this.state.filters.criticality = e.target.value;
            this.renderIncidents();
        });

        document.getElementById('filterType')?.addEventListener('change', (e) => {
            this.state.filters.type = e.target.value;
            this.renderIncidents();
        });

        document.getElementById('searchIncidents')?.addEventListener('input', (e) => {
            this.state.filters.search = e.target.value;
            this.renderIncidents();
        });

        // Botón nueva incidencia
        document.getElementById('newIncidentBtn')?.addEventListener('click', () => {
            this.state.currentIncident = null;
            const form = document.getElementById('incidentForm');
            if (form) form.reset();
            const modalTitle = document.getElementById('incidentModalLabel');
            if (modalTitle) {
                const lang = Translations?.currentLanguage || localStorage.getItem("osintLanguage") || "es";
                modalTitle.textContent = translations[lang]["NEW_CYBERSECURITY_INCIDENT"] || "Nueva Incidencia de Ciberseguridad";
            }
            const priorityBadge = document.getElementById('calculatedPriority');
            if (priorityBadge) {
                const lang = Translations?.currentLanguage || localStorage.getItem("osintLanguage") || "es";
                priorityBadge.textContent = translations[lang]["NOT_CALCULATED"] || "Sin calcular";
                priorityBadge.className = 'badge bg-secondary';
            }
            this.populateFormSelects();
        });

        // Botón guardar incidencia
        document.getElementById('saveIncidentBtn')?.addEventListener('click', (e) => {
            this.saveIncidentFromForm(e);
        });

        // Actualizar prioridad calculada al cambiar impacto/urgencia
        document.getElementById('incidentImpact')?.addEventListener('change', () => {
            this.updateCalculatedPriority();
        });

        document.getElementById('incidentUrgency')?.addEventListener('change', () => {
            this.updateCalculatedPriority();
        });

        // Toggle theme
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });
    },

    /**
     * Gestión de Temas
     */
    setupTheme: function () {
        const theme = localStorage.getItem('osintTheme') || 'dark';
        document.documentElement.setAttribute('data-bs-theme', theme);
        this.updateThemeIcons(theme);

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            // Remove any existing listeners to prevent double-execution
            const newToggle = themeToggle.cloneNode(true);
            themeToggle.parentNode.replaceChild(newToggle, themeToggle);

            newToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-bs-theme');
                const next = current === 'dark' ? 'light' : 'dark';

                document.documentElement.setAttribute('data-bs-theme', next);
                localStorage.setItem('osintTheme', next);
                this.updateThemeIcons(next);
            });
        }
    },

    updateThemeIcons: function (currentTheme) {
        currentTheme = currentTheme || document.documentElement.getAttribute("data-bs-theme");
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        const iconLight = themeToggle.querySelector('.icon-sun');
        const iconDark = themeToggle.querySelector('.icon-moon');

        if (iconLight && iconDark) {
            if (currentTheme === "dark") {
                iconLight.style.display = "inline-block";
                iconDark.style.display = "none";
            } else {
                iconLight.style.display = "none";
                iconDark.style.display = "inline-block";
            }
        }

        // 🆕 Sync footer logo
        const footerLogo = document.getElementById('footer-logo');
        if (footerLogo) {
            footerLogo.src = currentTheme === 'dark' ? 'logos/Aegisboard-B.png' : 'logos/Aegisboard-N.png';
        }
    },

    /**
     * Actualizar subcategorías
     */
    updateSubcategories: function (category) {
        const subcatSelect = document.getElementById('sgsi-subcategory');
        if (!subcatSelect) return;

        const cat = CSTaxonomy.sgsiCategories.find(c => c.category === category);
        if (!cat) return;

        subcatSelect.innerHTML = '<option value="">Seleccionar subcategoría...</option>' +
            cat.subcategories.map(sub => `<option value="${sub}">${sub}</option>`).join('');
    },

    /**
     * Utilidades
     */
    generateId: function () {
        return 'inc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    deepMerge: function (target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    },

    isObject: function (item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    populateFilters: function () {
        const lang = Translations?.currentLanguage || localStorage.getItem("osintLanguage") || "es";
        const allText = translations[lang]["ALL"] || "Todos";

        // Filtro de estado
        const statusFilter = document.getElementById('filterStatus');
        if (statusFilter) {
            statusFilter.innerHTML = `<option value="">-- ${allText} --</option>` +
                CSTaxonomy.statuses.map(status =>
                    `<option value="${status.value}">${lang === 'en' ? status.labelEN : status.label}</option>`
                ).join('');
        }

        // Filtro de criticidad
        const critFilter = document.getElementById('filterCriticality');
        if (critFilter) {
            critFilter.innerHTML = `<option value="">-- ${allText} --</option>` +
                CSTaxonomy.criticality.map(crit =>
                    `<option value="${crit.value}">${lang === 'en' ? crit.labelEN : crit.label}</option>`
                ).join('');
        }

        // Filtro de tipo
        const typeFilter = document.getElementById('filterType');
        if (typeFilter) {
            typeFilter.innerHTML = `<option value="">-- ${allText} --</option>` +
                CSTaxonomy.incidentTypes.map(type =>
                    `<option value="${type.code}">${lang === 'en' ? type.labelEN : type.label}</option>`
                ).join('');
        }
    },

    updateCalculatedPriority: function () {
        const impact = document.getElementById('incidentImpact')?.value;
        const urgency = document.getElementById('incidentUrgency')?.value;
        const priorityBadge = document.getElementById('calculatedPriority');

        if (impact && urgency && priorityBadge) {
            const lang = Translations?.currentLanguage || localStorage.getItem("osintLanguage") || "es";
            const priority = CSTaxonomy.getPriority(impact, urgency);
            console.log(`🔍 Priority calculation: Impact=${impact}, Urgency=${urgency}, Result=${priority}`);
            const critObj = CSTaxonomy.criticality.find(c => c.value === priority);

            if (critObj) {
                const label = lang === 'en' ? critObj.labelEN : critObj.label;
                priorityBadge.textContent = label;

                // Mapeo de colores para Tabler/Bootstrap 5
                const colorMap = {
                    'Low': 'bg-success',
                    'Medium': 'bg-warning',
                    'High': 'bg-orange',
                    'Critical': 'bg-danger'
                };

                priorityBadge.className = 'badge ' + (colorMap[priority] || 'bg-secondary');
                console.log(`✅ Priority set: ${priorityBadge.textContent}, class: ${priorityBadge.className}`);
            } else {
                console.error(`❌ No criticality object found for priority: ${priority}`);
            }
        }
    },

    showAlert: function (message, type = 'success') {
        const theme = document.documentElement.getAttribute('data-bs-theme') || 'dark';

        Swal.fire({
            icon: type,
            title: message,
            confirmButtonText: 'OK',
            background: 'var(--modal-bg)',
            color: 'var(--text)',
            showClass: {
                popup: 'premium-swal-show'
            },
            hideClass: {
                popup: 'premium-swal-hide'
            },
            customClass: {
                popup: 'premium-swal-popup',
                title: 'premium-swal-title'
            }
        });
    },

    confirmDelete: function (title, text, confirmBtnText, callback) {
        const theme = document.documentElement.getAttribute('data-bs-theme') || 'dark';
        const lang = localStorage.getItem("osintLanguage") || "es";

        Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: confirmBtnText,
            cancelButtonText: lang === 'en' ? 'Cancel' : 'Cancelar',
            background: 'var(--modal-bg)',
            color: 'var(--text)',
            showClass: {
                popup: 'premium-swal-show'
            },
            hideClass: {
                popup: 'premium-swal-hide'
            },
            customClass: {
                popup: 'premium-swal-popup',
                title: 'premium-swal-title'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                callback();
            }
        });
    }
};

// Exportar para uso global y compatibilidad
window.IncidentManager = IncidentManager;
export default IncidentManager;

// Auto-inicializar si estamos en la página de incidentes
if (typeof window !== 'undefined' && window.location.pathname.includes('incidents.html')) {
    document.addEventListener('DOMContentLoaded', function () {
        // Verificar autenticación
        if (!Auth.requireAuth()) return;

        IncidentManager.init();
    });
}
