/**
 * Aegis Board - Crypto Utilities
 * Provides lightweight obfuscation for LocalStorage data.
 * Uses Unicode-safe Base64 encoding.
 */

const CryptoUtils = {
    _seed: 'aegis-board-secure-v2',

    /**
     * Encode data to Unicode-safe Base64
     * @param {any} data - Object or string
     * @returns {string} base64 encoded string
     */
    encrypt: function (data) {
        try {
            const json = typeof data === 'string' ? data : JSON.stringify(data);
            // Unicode-safe: encode to UTF-8 bytes then base64
            return btoa(unescape(encodeURIComponent(json)));
        } catch (e) {
            console.error('Encryption error:', e);
            // Fallback: plain JSON (will still be readable by decrypt)
            return typeof data === 'string' ? data : JSON.stringify(data);
        }
    },

    /**
     * Decode Unicode-safe Base64
     * @param {string} encoded
     * @returns {object|string}
     */
    decrypt: function (encoded) {
        if (!encoded) return encoded;
        try {
            // Try base64 decode first
            const json = decodeURIComponent(escape(atob(encoded)));
            try {
                return JSON.parse(json);
            } catch {
                return json;
            }
        } catch {
            // Fallback: try plain JSON (for backward compatibility)
            try {
                return JSON.parse(encoded);
            } catch {
                return encoded;
            }
        }
    }
};

export default CryptoUtils;
