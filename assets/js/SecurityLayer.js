/**
 * SECURITY LAYER - CrowdSense AI
 * Implements high-level sanitization and protection protocols.
 */

const SECURITY = {
    /**
     * Sanitizes user input to prevent XSS and Injection attacks.
     * @param {string} str - Raw user input.
     * @returns {string} - Cleaned output.
     */
    sanitize: (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Validates if a search query is within acceptable parameters.
     * @param {string} val - Search query.
     * @returns {boolean}
     */
    validateSearch: (val) => {
        const clean = val.trim();
        return clean.length > 2 && clean.length < 100;
    }
};
