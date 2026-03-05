
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('ext-search');
    const links = {
        'go-dashboard': 'index.html',
        'go-admin': 'admin.html',
        'go-incidents': 'incidents.html',
        'go-docs': 'technical_docs.md'
    };

    // Manejar búsqueda
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            const query = encodeURIComponent(searchInput.value.trim());
            chrome.tabs.create({ url: `https://aegisboard.dev/index.html?q=${query}` });
        }
    });

    // Manejar botones
    Object.keys(links).forEach(id => {
        document.getElementById(id).addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: `https://aegisboard.dev/${links[id]}` });
        });
    });
});
