/**
 * Aegis Board - Crypto Utilities
 * Provides lightweight encryption/obfuscation for LocalStorage data.
 * Note: This is client-side obfuscation. For true security, use Supabase/Backend.
 */

const CryptoUtils = {
    // Simple key derived from a static seed (to be replaced by user-specific key in future)
    _seed: 'aegis-board-secure-v2',

    /**
     * Encrypt data (Base64 + XOR simple obfuscation for performance/local use)
     * @param {string} text 
     * @returns {string}
     */
    encrypt: function (text) {
        if (!text) return text;
        try {
            const data = typeof text === 'string' ? text : JSON.stringify(text);
            let result = '';
            for (let i = 0; i < data.length; i++) {
                result += String.fromCharCode(data.charCodeAt(i) ^ this._seed.charCodeAt(i % this._seed.length));
            }
            return btoa(result);
        } catch (e) {
            console.error('Encryption error:', e);
            return text;
        }
    },

    /**
     * Decrypt data
     * @param {string} encoded 
     * @returns {string|object}
     */
    decrypt: function (encoded) {
        if (!encoded) return encoded;
        try {
            const data = atob(encoded);
            let result = '';
            for (let i = 0; i < data.length; i++) {
                result += String.fromCharCode(data.charCodeAt(i) ^ this._seed.charCodeAt(i % this._seed.length));
            }
            try {
                return JSON.parse(result);
            } catch (e) {
                return result;
            }
        } catch (e) {
            // If it's not encoded or fails, return original (graceful degradation)
            return encoded;
        }
    }
};

export default CryptoUtils;
