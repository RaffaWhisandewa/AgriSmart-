// ============================================
// LANGUAGE MANAGER - AgriSmart Multi-Language System
// File: lang/language.js
// ============================================

class LanguageManager {
    constructor() {
        this.STORAGE_KEY = 'agrismart_language';
        this.DEFAULT_LANGUAGE = 'id';
        this.currentLanguage = this.getStoredLanguage();
        this.translations = {};
        this.observers = [];
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    /**
     * Initialize the language system
     * Call this when page loads
     */
    init() {
        // Load translations
        this.translations = {
            id: typeof lang_id !== 'undefined' ? lang_id : {},
            en: typeof lang_en !== 'undefined' ? lang_en : {}
        };

        // Apply current language
        this.applyLanguage();
        
        // Initialize language selector if exists
        this.initLanguageSelector();
        
        console.log(`Language Manager initialized. Current language: ${this.currentLanguage}`);
    }

    // ==========================================
    // LANGUAGE STORAGE
    // ==========================================
    
    /**
     * Get stored language from localStorage
     */
    getStoredLanguage() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored || this.DEFAULT_LANGUAGE;
    }

    /**
     * Store language preference
     */
    storeLanguage(lang) {
        localStorage.setItem(this.STORAGE_KEY, lang);
    }

    // ==========================================
    // LANGUAGE SWITCHING
    // ==========================================
    
    /**
     * Set current language
     * @param {string} lang - Language code ('id' or 'en')
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this.storeLanguage(lang);
            this.applyLanguage();
            this.notifyObservers();
            
            // Show notification
            this.showLanguageChangeNotification(lang);
            
            console.log(`Language changed to: ${lang}`);
            return true;
        }
        console.warn(`Language '${lang}' not found`);
        return false;
    }

    /**
     * Toggle between Indonesian and English
     */
    toggleLanguage() {
        const newLang = this.currentLanguage === 'id' ? 'en' : 'id';
        this.setLanguage(newLang);
    }

    /**
     * Get current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // ==========================================
    // TRANSLATION RETRIEVAL
    // ==========================================
    
    /**
     * Get translation by key path
     * @param {string} keyPath - Dot notation path (e.g., 'nav.dashboard')
     * @param {string} fallback - Fallback text if translation not found
     */
    t(keyPath, fallback = '') {
        const keys = keyPath.split('.');
        let result = this.translations[this.currentLanguage];
        
        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                console.warn(`Translation not found: ${keyPath}`);
                return fallback || keyPath;
            }
        }
        
        return result;
    }

    /**
     * Alias for t() - more readable
     */
    translate(keyPath, fallback = '') {
        return this.t(keyPath, fallback);
    }

    /**
     * Get all translations for current language
     */
    getAllTranslations() {
        return this.translations[this.currentLanguage] || {};
    }

    // ==========================================
    // DOM MANIPULATION
    // ==========================================
    
    /**
     * Apply language to all elements with data-lang attribute
     */
    applyLanguage() {
        // Update all elements with data-lang attribute
        document.querySelectorAll('[data-lang]').forEach(element => {
            const keyPath = element.getAttribute('data-lang');
            const translation = this.t(keyPath);
            
            if (translation) {
                // Check if element has specific target attribute
                const target = element.getAttribute('data-lang-target');
                
                if (target === 'placeholder') {
                    element.placeholder = translation;
                } else if (target === 'title') {
                    element.title = translation;
                } else if (target === 'value') {
                    element.value = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update elements with data-lang-placeholder attribute
        document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
            const keyPath = element.getAttribute('data-lang-placeholder');
            const translation = this.t(keyPath);
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Update select options with data-lang-option attribute
        document.querySelectorAll('[data-lang-option]').forEach(element => {
            const keyPath = element.getAttribute('data-lang-option');
            const translation = this.t(keyPath);
            if (translation) {
                // Keep any emoji prefix if present
                const currentText = element.textContent;
                const emojiMatch = currentText.match(/^[\u{1F1E0}-\u{1F1FF}]{2}\s*/u);
                if (emojiMatch) {
                    element.textContent = emojiMatch[0] + translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Update language selector if exists
        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            langSelect.value = this.currentLanguage;
        }
    }

    /**
     * Update specific element with translation
     * @param {string} elementId - Element ID
     * @param {string} keyPath - Translation key path
     */
    updateElement(elementId, keyPath) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = this.t(keyPath);
        }
    }

    /**
     * Update multiple elements
     * @param {Object} mappings - Object with elementId: keyPath pairs
     */
    updateElements(mappings) {
        for (const [elementId, keyPath] of Object.entries(mappings)) {
            this.updateElement(elementId, keyPath);
        }
    }

    // ==========================================
    // LANGUAGE SELECTOR
    // ==========================================
    
    /**
     * Initialize language selector dropdown
     */
    initLanguageSelector() {
        const selector = document.getElementById('language-select');
        if (selector) {
            selector.value = this.currentLanguage;
            selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }

    /**
     * Create language selector HTML
     * @returns {string} HTML string for language selector
     */
    createLanguageSelectorHTML() {
        return `
            <select id="language-select" class="select-field language-selector" onchange="langManager.setLanguage(this.value)">
                <option value="id" ${this.currentLanguage === 'id' ? 'selected' : ''}>🇮🇩 Bahasa Indonesia</option>
                <option value="en" ${this.currentLanguage === 'en' ? 'selected' : ''}>🇬🇧 English</option>
            </select>
        `;
    }

    // ==========================================
    // OBSERVER PATTERN
    // ==========================================
    
    /**
     * Add observer for language changes
     * @param {Function} callback - Function to call when language changes
     */
    addObserver(callback) {
        if (typeof callback === 'function') {
            this.observers.push(callback);
        }
    }

    /**
     * Remove observer
     * @param {Function} callback - Function to remove
     */
    removeObserver(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    /**
     * Notify all observers of language change
     */
    notifyObservers() {
        this.observers.forEach(callback => {
            try {
                callback(this.currentLanguage);
            } catch (error) {
                console.error('Observer error:', error);
            }
        });
    }

    // ==========================================
    // NOTIFICATIONS
    // ==========================================
    
    /**
     * Show notification when language changes
     * @param {string} lang - New language code
     */
    showLanguageChangeNotification(lang) {
        const messages = {
            id: 'Bahasa berhasil diubah ke Bahasa Indonesia',
            en: 'Language successfully changed to English'
        };

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'lang-notification';
        notification.innerHTML = `
            <i class="fas fa-globe"></i>
            <span>${messages[lang]}</span>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('lang-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'lang-notification-styles';
            styles.textContent = `
                .lang-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #2c7a2c, #5cb85c);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 5px 20px rgba(44, 122, 44, 0.3);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards;
                    font-weight: 500;
                    font-family: 'Poppins', sans-serif;
                }
                
                .lang-notification i {
                    font-size: 1.2rem;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes fadeOut {
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
                
                body.dark-mode .lang-notification {
                    background: linear-gradient(135deg, #1a4d1a, #2c7a2c);
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after animation
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    
    /**
     * Format translation with variables
     * @param {string} keyPath - Translation key path
     * @param {Object} variables - Variables to replace
     * Example: format('greeting', {name: 'John'}) 
     * If translation is "Hello {name}", result is "Hello John"
     */
    format(keyPath, variables = {}) {
        let text = this.t(keyPath);
        
        for (const [key, value] of Object.entries(variables)) {
            text = text.replace(new RegExp(`{${key}}`, 'g'), value);
        }
        
        return text;
    }

    /**
     * Check if translation exists
     * @param {string} keyPath - Translation key path
     */
    has(keyPath) {
        const keys = keyPath.split('.');
        let result = this.translations[this.currentLanguage];
        
        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get language name
     * @param {string} langCode - Language code
     */
    getLanguageName(langCode) {
        const names = {
            id: 'Bahasa Indonesia',
            en: 'English'
        };
        return names[langCode] || langCode;
    }

    /**
     * Get all available languages
     */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
}

// ==========================================
// GLOBAL INSTANCE
// ==========================================

// Create global instance
const langManager = new LanguageManager();

// ==========================================
// HELPER FUNCTIONS (Global)
// ==========================================

/**
 * Shorthand function for translation
 * Usage: __('nav.dashboard')
 */
function __(keyPath, fallback = '') {
    return langManager.t(keyPath, fallback);
}

/**
 * Update page translations
 * Call this after dynamically adding content
 */
function updatePageTranslations() {
    langManager.applyLanguage();
}

/**
 * Change language
 * Usage: changeLanguage('en')
 */
function changeLanguage(lang) {
    langManager.setLanguage(lang);
}

/**
 * Get current language
 */
function getCurrentLanguage() {
    return langManager.getCurrentLanguage();
}

// ==========================================
// AUTO-INITIALIZATION
// ==========================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure language files are loaded
    setTimeout(() => {
        langManager.init();
    }, 100);
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LanguageManager, langManager };
}