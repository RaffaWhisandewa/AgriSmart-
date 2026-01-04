// ============================================
// DARK MODE MANAGER - AgriSmart
// File: js/darkmode.js
// ============================================

class DarkModeManager {
    constructor() {
        this.STORAGE_KEY = 'agrismart_dark_mode';
        this.isDarkMode = this.getStoredMode();
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    /**
     * Initialize dark mode system
     * Call this when page loads
     */
    init() {
        // Apply saved mode immediately
        this.applyMode();
        
        // Initialize toggle switch if exists
        this.initToggleSwitch();
        
        console.log(`Dark Mode Manager initialized. Dark mode: ${this.isDarkMode}`);
    }

    // ==========================================
    // STORAGE
    // ==========================================
    
    /**
     * Get stored dark mode preference
     */
    getStoredMode() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored === 'true';
    }

    /**
     * Store dark mode preference
     */
    storeMode(isDark) {
        localStorage.setItem(this.STORAGE_KEY, isDark.toString());
    }

    // ==========================================
    // MODE SWITCHING
    // ==========================================
    
    /**
     * Enable dark mode
     */
    enable() {
        this.isDarkMode = true;
        this.storeMode(true);
        this.applyMode();
    }

    /**
     * Disable dark mode
     */
    disable() {
        this.isDarkMode = false;
        this.storeMode(false);
        this.applyMode();
    }

    /**
     * Toggle dark mode
     */
    toggle() {
        if (this.isDarkMode) {
            this.disable();
        } else {
            this.enable();
        }
        return this.isDarkMode;
    }

    /**
     * Check if dark mode is enabled
     */
    isEnabled() {
        return this.isDarkMode;
    }

    // ==========================================
    // APPLY MODE
    // ==========================================
    
    /**
     * Apply current mode to page
     */
    applyMode() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Update toggle switch if exists
        this.updateToggleSwitch();
    }

    // ==========================================
    // TOGGLE SWITCH
    // ==========================================
    
    /**
     * Initialize toggle switch on settings page
     */
    initToggleSwitch() {
        const toggleSwitch = document.getElementById('dark-mode-toggle');
        if (toggleSwitch) {
            // Set initial state
            if (this.isDarkMode) {
                toggleSwitch.classList.add('active');
            } else {
                toggleSwitch.classList.remove('active');
            }
        }
    }

    /**
     * Update toggle switch state
     */
    updateToggleSwitch() {
        const toggleSwitch = document.getElementById('dark-mode-toggle');
        if (toggleSwitch) {
            if (this.isDarkMode) {
                toggleSwitch.classList.add('active');
            } else {
                toggleSwitch.classList.remove('active');
            }
        }
    }
}

// ==========================================
// GLOBAL INSTANCE
// ==========================================

const darkModeManager = new DarkModeManager();

// ==========================================
// HELPER FUNCTIONS (Global)
// ==========================================

/**
 * Toggle dark mode
 * Usage: toggleDarkMode() or onclick="toggleDarkMode(this)"
 */
function toggleDarkMode(element) {
    const isDark = darkModeManager.toggle();
    
    // Update toggle switch element if passed
    if (element) {
        if (isDark) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    }
    
    return isDark;
}

/**
 * Check if dark mode is enabled
 */
function isDarkModeEnabled() {
    return darkModeManager.isEnabled();
}

/**
 * Enable dark mode
 */
function enableDarkMode() {
    darkModeManager.enable();
}

/**
 * Disable dark mode
 */
function disableDarkMode() {
    darkModeManager.disable();
}

// ==========================================
// AUTO-INITIALIZATION
// ==========================================

// Apply dark mode immediately when script loads (before DOM ready)
// This prevents flash of light mode
(function() {
    const isDark = localStorage.getItem('agrismart_dark_mode') === 'true';
    if (isDark) {
        document.documentElement.classList.add('dark-mode');
    }
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    darkModeManager.init();
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DarkModeManager, darkModeManager };
}