// ============================================
// AgriSmart Pengaturan - WebSocket Integration
// ============================================

// ESP32 Configuration
let ESP32_IP = '192.168.1.61';
let WS_PORT = 81;
let WS_URL = `ws://${ESP32_IP}:${WS_PORT}`;

// WebSocket instance
let webSocket = null;

// Current settings
let currentSettings = {
    general: {
        darkMode: false,
        language: 'id',
        timezone: 'WIB'
    },
    sensor: {
        interval: 5,
        autoCalibration: true
    },
    thresholds: {
        humidity_dry: 50,
        humidity_wet: 70,
        ph_acidic: 5.5,
        ph_alkaline: 7.5
    },
    notification: {
        email: true,
        push: false
    },
    security: {
        twoFactor: false,
        sessionTimeout: 30
    },
    esp32: {
        ip: '192.168.1.61',
        cam_ip: '192.168.1.101'
    }
};

// ============================================
// WEBSOCKET FUNCTIONS
// ============================================

function initWebSocket() {
    const savedIP = localStorage.getItem('esp32_ip');
    if (savedIP) {
        ESP32_IP = savedIP;
        WS_URL = `ws://${ESP32_IP}:${WS_PORT}`;
    }
    
    console.log(`🔌 Connecting to WebSocket: ${WS_URL}`);
    
    try {
        webSocket = new WebSocket(WS_URL);
        
        webSocket.onopen = function(event) {
            console.log('✅ WebSocket Connected!');
            showNotification('Terhubung ke ESP32!', 'success');
            
            // Request current settings from ESP32
            webSocket.send(JSON.stringify({ command: 'get_status' }));
        };
        
        webSocket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                console.log('📥 ESP32 Settings:', data);
                
                // Update local settings from ESP32
                if (data.interval) {
                    currentSettings.sensor.interval = data.interval;
                    const intervalInput = document.getElementById('sensor-interval');
                    if (intervalInput) intervalInput.value = data.interval;
                }
                
                if (data.thresholds) {
                    currentSettings.thresholds = { ...currentSettings.thresholds, ...data.thresholds };
                    updateThresholdInputs();
                }
            } catch (e) {
                console.error('Error parsing WebSocket data:', e);
            }
        };
        
        webSocket.onclose = function(event) {
            console.log('❌ WebSocket Disconnected');
        };
        
        webSocket.onerror = function(error) {
            console.error('WebSocket Error:', error);
        };
        
    } catch (e) {
        console.error('Failed to create WebSocket:', e);
    }
}

function sendSettingsToESP32() {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        // Send interval
        webSocket.send(JSON.stringify({
            command: 'set_interval',
            value: parseInt(currentSettings.sensor.interval)
        }));
        
        // Send thresholds
        webSocket.send(JSON.stringify({
            command: 'set_threshold',
            humidity_dry: currentSettings.thresholds.humidity_dry,
            humidity_wet: currentSettings.thresholds.humidity_wet,
            ph_acidic: currentSettings.thresholds.ph_acidic,
            ph_alkaline: currentSettings.thresholds.ph_alkaline
        }));
        
        console.log('✅ Settings sent to ESP32');
        return true;
    } else {
        console.warn('WebSocket not connected');
        return false;
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function createLeaves() {
    const leavesContainer = document.getElementById('leaves-container');
    if (!leavesContainer) return;
    
    const leafTypes = ['🍀', '🌿', '🍃', '🌱', '☘️'];
    const leafColors = ['#2c7a2c', '#3a9e3a', '#4db84d', '#5cb85c', '#6ac36a'];
    
    for (let i = 0; i < 15; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        
        const useEmoji = Math.random() > 0.5;
        if (useEmoji) {
            leaf.textContent = leafTypes[Math.floor(Math.random() * leafTypes.length)];
            leaf.style.fontSize = `${Math.random() * 20 + 10}px`;
        } else {
            const size = Math.random() * 30 + 20;
            leaf.innerHTML = `
                <svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <path fill="${leafColors[Math.floor(Math.random() * leafColors.length)]}" 
                          d="M50 10 Q70 40 50 90 Q30 40 50 10 Z" 
                          opacity="${Math.random() * 0.5 + 0.3}"/>
                </svg>
            `;
        }
        
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.animationDuration = `${Math.random() * 20 + 10}s`;
        leaf.style.animationDelay = `${Math.random() * 5}s`;
        
        leavesContainer.appendChild(leaf);
    }
}

// Toggle switch with ripple effect
function toggleSwitch(element) {
    element.classList.toggle('active');
    
    // Add ripple effect
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background-color: rgba(44, 122, 44, 0.2);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${size/2}px`;
    ripple.style.top = `${size/2}px`;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);

    // Show notification
    const isActive = element.classList.contains('active');
    const settingItem = element.closest('.setting-item');
    if (settingItem) {
        const settingLabel = settingItem.querySelector('.setting-label');
        if (settingLabel) {
            const labelText = settingLabel.textContent;
            const action = isActive ? 'Diaktifkan' : 'Dinonaktifkan';
            showNotification(`${labelText} ${action}`, 'success');
        }
    }
}

// Update threshold input fields from current settings
function updateThresholdInputs() {
    const humidityDry = document.getElementById('threshold-humidity-dry');
    const humidityWet = document.getElementById('threshold-humidity-wet');
    const phAcidic = document.getElementById('threshold-ph-acidic');
    const phAlkaline = document.getElementById('threshold-ph-alkaline');
    
    if (humidityDry) humidityDry.value = currentSettings.thresholds.humidity_dry;
    if (humidityWet) humidityWet.value = currentSettings.thresholds.humidity_wet;
    if (phAcidic) phAcidic.value = currentSettings.thresholds.ph_acidic;
    if (phAlkaline) phAlkaline.value = currentSettings.thresholds.ph_alkaline;
}

// ============================================
// SETTINGS FUNCTIONS
// ============================================

function saveSettings() {
    try {
        // Get all settings from UI
        currentSettings = getAllSettings();
        
        // Save to localStorage
        localStorage.setItem('agrismartSettings', JSON.stringify(currentSettings));
        
        // Save ESP32 IPs
        localStorage.setItem('esp32_ip', currentSettings.esp32.ip);
        localStorage.setItem('espcam_ip', currentSettings.esp32.cam_ip);
        
        // Try to send to ESP32 (silent - no error notification)
        sendSettingsToESP32();
        
        // Show success notification
        showNotification('✅ Pengaturan berhasil disimpan!', 'success');
        
        // Update button
        const btn = event.target.closest('.btn');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Tersimpan!';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        }
        
    } catch (error) {
        console.error('Gagal menyimpan pengaturan:', error);
        showNotification('❌ Gagal menyimpan pengaturan! ' + error.message, 'error');
        
        // Update button to show error
        const btn = event.target.closest('.btn');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-times"></i> Gagal!';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        }
    }
}

function exportSettings() {
    const settings = getAllSettings();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement('a');
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "agrismart_settings.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    showNotification('Pengaturan berhasil di-export!', 'success');
}

function resetSettings() {
    if (!confirm('Apakah Anda yakin ingin mengembalikan semua pengaturan ke nilai default?')) {
        return;
    }
    
    // Reset to defaults
    currentSettings = {
        general: {
            darkMode: false,
            language: 'id',
            timezone: 'WIB'
        },
        sensor: {
            interval: 5,
            autoCalibration: true
        },
        thresholds: {
            humidity_dry: 50,
            humidity_wet: 70,
            ph_acidic: 5.5,
            ph_alkaline: 7.5
        },
        notification: {
            email: true,
            push: false
        },
        security: {
            twoFactor: false,
            sessionTimeout: 30
        },
        esp32: {
            ip: '192.168.1.100',
            cam_ip: '192.168.1.101'
        }
    };
    
    // Reset dark mode
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.classList.remove('active');
    }
    if (typeof disableDarkMode === 'function') {
        disableDarkMode();
    }
    
    // Reset all toggle switches
    const toggleSwitches = document.querySelectorAll('.toggle-switch:not(#dark-mode-toggle)');
    toggleSwitches.forEach((switchEl, index) => {
        // Auto calibration and email notification should be ON by default
        if (index === 0 || index === 1) {
            switchEl.classList.add('active');
        } else {
            switchEl.classList.remove('active');
        }
    });
    
    // Reset input fields
    const intervalInput = document.getElementById('sensor-interval');
    if (intervalInput) intervalInput.value = 5;
    
    // Reset threshold inputs
    updateThresholdInputs();
    
    // Reset ESP32 IP inputs
    const esp32IpInput = document.getElementById('esp32-ip-setting');
    const camIpInput = document.getElementById('espcam-ip-setting');
    if (esp32IpInput) esp32IpInput.value = '192.168.1.100';
    if (camIpInput) camIpInput.value = '192.168.1.101';
    
    // Reset language
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.value = 'id';
        if (typeof changeLanguage === 'function') {
            changeLanguage('id');
        }
    }
    
    // Clear localStorage
    localStorage.removeItem('agrismartSettings');
    localStorage.removeItem('agrismart_dark_mode');
    
    showNotification('Pengaturan telah direset ke default!', 'info');
}

function getAllSettings() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const toggleSwitches = document.querySelectorAll('.toggle-switch:not(#dark-mode-toggle)');
    const intervalInput = document.getElementById('sensor-interval');
    
    // Get threshold values
    const humidityDry = document.getElementById('threshold-humidity-dry');
    const humidityWet = document.getElementById('threshold-humidity-wet');
    const phAcidic = document.getElementById('threshold-ph-acidic');
    const phAlkaline = document.getElementById('threshold-ph-alkaline');
    
    // Get ESP32 IPs
    const esp32IpInput = document.getElementById('esp32-ip-setting');
    const camIpInput = document.getElementById('espcam-ip-setting');
    
    return {
        general: {
            darkMode: darkModeToggle ? darkModeToggle.classList.contains('active') : false,
            language: document.getElementById('language-select')?.value || 'id',
            timezone: document.querySelector('select[name="timezone"]')?.value || 'WIB'
        },
        sensor: {
            interval: intervalInput ? parseInt(intervalInput.value) : 5,
            autoCalibration: toggleSwitches[0] ? toggleSwitches[0].classList.contains('active') : true
        },
        thresholds: {
            humidity_dry: humidityDry ? parseInt(humidityDry.value) : 50,
            humidity_wet: humidityWet ? parseInt(humidityWet.value) : 70,
            ph_acidic: phAcidic ? parseFloat(phAcidic.value) : 5.5,
            ph_alkaline: phAlkaline ? parseFloat(phAlkaline.value) : 7.5
        },
        notification: {
            email: toggleSwitches[1] ? toggleSwitches[1].classList.contains('active') : true,
            push: toggleSwitches[2] ? toggleSwitches[2].classList.contains('active') : false
        },
        security: {
            twoFactor: toggleSwitches[3] ? toggleSwitches[3].classList.contains('active') : false,
            sessionTimeout: document.querySelector('select[name="session-timeout"]')?.value || 30
        },
        esp32: {
            ip: esp32IpInput ? esp32IpInput.value : '192.168.1.100',
            cam_ip: camIpInput ? camIpInput.value : '192.168.1.101'
        }
    };
}

function applyStoredSettings(settings) {
    const toggleSwitches = document.querySelectorAll('.toggle-switch:not(#dark-mode-toggle)');
    
    // Apply sensor settings
    if (settings.sensor) {
        const intervalInput = document.getElementById('sensor-interval');
        if (intervalInput && settings.sensor.interval) {
            intervalInput.value = settings.sensor.interval;
        }
        if (toggleSwitches[0]) {
            toggleSwitches[0].classList.toggle('active', settings.sensor.autoCalibration);
        }
    }
    
    // Apply threshold settings
    if (settings.thresholds) {
        currentSettings.thresholds = { ...currentSettings.thresholds, ...settings.thresholds };
        updateThresholdInputs();
    }
    
    // Apply notification settings
    if (settings.notification) {
        if (toggleSwitches[1]) {
            toggleSwitches[1].classList.toggle('active', settings.notification.email);
        }
        if (toggleSwitches[2]) {
            toggleSwitches[2].classList.toggle('active', settings.notification.push);
        }
    }
    
    // Apply security settings
    if (settings.security) {
        if (toggleSwitches[3]) {
            toggleSwitches[3].classList.toggle('active', settings.security.twoFactor);
        }
    }
    
    // Apply ESP32 IPs
    if (settings.esp32) {
        const esp32IpInput = document.getElementById('esp32-ip-setting');
        const camIpInput = document.getElementById('espcam-ip-setting');
        if (esp32IpInput) esp32IpInput.value = settings.esp32.ip;
        if (camIpInput) camIpInput.value = settings.esp32.cam_ip;
    }
}

// ============================================
// NOTIFICATION - IMPROVED WITH BETTER ANIMATION
// ============================================

function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => {
        n.classList.add('hide');
        setTimeout(() => n.remove(), 400);
    });
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create notification content
    const iconMap = {
        success: 'fa-check-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${iconMap[type] || iconMap.info}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
    });
    
    // Remove after duration
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, duration);
}

// ============================================
// TEST CONNECTION
// ============================================

async function testESP32Connection() {
    const esp32IpInput = document.getElementById('esp32-ip-setting');
    const ip = esp32IpInput ? esp32IpInput.value : ESP32_IP;
    
    showNotification(`Menguji koneksi ke ${ip}...`, 'info');
    
    // Method 1: Try WebSocket connection (more reliable for ESP32)
    try {
        const wsTest = new WebSocket(`ws://${ip}:${WS_PORT}`);
        
        const wsPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                wsTest.close();
                reject(new Error('Timeout'));
            }, 5000);
            
            wsTest.onopen = () => {
                clearTimeout(timeout);
                wsTest.close();
                resolve(true);
            };
            
            wsTest.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('WebSocket error'));
            };
        });
        
        await wsPromise;
        showNotification(`✅ ESP32 terhubung! (${ip}:${WS_PORT})`, 'success');
        return;
        
    } catch (wsError) {
        console.log('WebSocket test failed, trying HTTP...');
    }
    
    // Method 2: Try HTTP fetch with no-cors (fallback)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`http://${ip}/ping`, {
            method: 'GET',
            mode: 'no-cors', // This allows request but response is opaque
            cache: 'no-cache',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // With no-cors, we can't read response but if no error, connection exists
        showNotification(`✅ ESP32 dapat dijangkau! (${ip})`, 'success');
        
    } catch (error) {
        if (error.name === 'AbortError') {
            showNotification(`❌ Timeout: ESP32 tidak merespons (${ip})`, 'error');
        } else {
            showNotification(`❌ Koneksi gagal: ${ip} tidak dapat dijangkau`, 'error');
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('AgriSmart Pengaturan - Initializing...');
    
    // Create floating leaves
    createLeaves();
    
    // Load saved settings
    const savedSettings = localStorage.getItem('agrismartSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            currentSettings = { ...currentSettings, ...settings };
            applyStoredSettings(settings);
        } catch (e) {
            console.error('Gagal memuat pengaturan:', e);
        }
    }
    
    // Initialize WebSocket after 1 second
    setTimeout(() => {
        initWebSocket();
    }, 1000);
    
    // Initialize Session Timeout
    initSessionTimeout();
    
    // Initialize Push Notification toggle
    initPushNotification();
    
    // Add ripple effect to all buttons
    initButtonRippleEffect();
    
    console.log('AgriSmart Pengaturan - Ready');
});

// ============================================
// BUTTON RIPPLE EFFECT
// ============================================

function initButtonRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            
            // Get button dimensions
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            // Calculate click position relative to button
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            // Set ripple styles
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Add ripple to button
            button.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Cleanup
window.addEventListener('beforeunload', function() {
    if (webSocket) {
        webSocket.close();
    }
});

// ============================================
// SESSION TIMEOUT FUNCTIONS
// ============================================

let sessionTimeoutId = null;
let sessionWarningId = null;
let lastActivityTime = Date.now();

function initSessionTimeout() {
    // Get timeout value from settings (default 30 minutes)
    const timeoutMinutes = currentSettings.security.sessionTimeout || 30;
    
    // Listen for user activity
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
        document.addEventListener(event, resetSessionTimer, { passive: true });
    });
    
    // Start the timer
    startSessionTimer(timeoutMinutes);
    
    console.log(`⏱️ Session timeout initialized: ${timeoutMinutes} minutes`);
}

function startSessionTimer(minutes) {
    // Clear existing timers
    if (sessionTimeoutId) clearTimeout(sessionTimeoutId);
    if (sessionWarningId) clearTimeout(sessionWarningId);
    
    // If 0, disable timeout (stay connected)
    if (minutes === 0 || minutes === '0') {
        console.log('⏱️ Session timeout disabled - Tetap Terhubung');
        return;
    }
    
    const timeoutMs = minutes * 60 * 1000;
    const warningMs = timeoutMs - (60 * 1000); // Warning 1 minute before timeout
    
    // Set warning timer (1 minute before timeout)
    if (warningMs > 0) {
        sessionWarningId = setTimeout(() => {
            showSessionWarning();
        }, warningMs);
    }
    
    // Set timeout timer
    sessionTimeoutId = setTimeout(() => {
        handleSessionTimeout();
    }, timeoutMs);
    
    lastActivityTime = Date.now();
}

function resetSessionTimer() {
    const now = Date.now();
    // Only reset if more than 1 second has passed (avoid excessive resets)
    if (now - lastActivityTime > 1000) {
        const timeoutMinutes = currentSettings.security.sessionTimeout || 30;
        startSessionTimer(timeoutMinutes);
        
        // Hide warning if shown
        const warningModal = document.getElementById('session-warning-modal');
        if (warningModal) {
            warningModal.remove();
        }
    }
}

function showSessionWarning() {
    // Check if warning already exists
    if (document.getElementById('session-warning-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'session-warning-modal';
    modal.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: var(--card-bg, #1a1a2e);
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                border: 1px solid rgba(255,255,255,0.1);
            ">
                <div style="font-size: 50px; margin-bottom: 15px;">⏱️</div>
                <h3 style="color: #f59e0b; margin-bottom: 10px;">Sesi Akan Berakhir</h3>
                <p style="color: var(--text-secondary, #888); margin-bottom: 20px;">
                    Sesi Anda akan berakhir dalam <span id="countdown-timer" style="color: #dc3545; font-weight: bold;">60</span> detik karena tidak ada aktivitas.
                </p>
                <button onclick="extendSession()" style="
                    background: linear-gradient(135deg, #2c7a2c, #5cb85c);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 1rem;
                    cursor: pointer;
                    margin-right: 10px;
                ">
                    <i class="fas fa-clock"></i> Tetap Login
                </button>
                <button onclick="handleSessionTimeout()" style="
                    background: rgba(255,255,255,0.1);
                    color: var(--text-primary, #fff);
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 1rem;
                    cursor: pointer;
                ">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Start countdown
    let countdown = 60;
    const countdownEl = document.getElementById('countdown-timer');
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdownEl) countdownEl.textContent = countdown;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    // Store interval ID for cleanup
    modal.dataset.countdownInterval = countdownInterval;
}

function extendSession() {
    // Remove warning modal
    const modal = document.getElementById('session-warning-modal');
    if (modal) {
        const intervalId = modal.dataset.countdownInterval;
        if (intervalId) clearInterval(parseInt(intervalId));
        modal.remove();
    }
    
    // Reset timer
    resetSessionTimer();
    showNotification('Sesi diperpanjang!', 'success');
}

function handleSessionTimeout() {
    // Clear timers
    if (sessionTimeoutId) clearTimeout(sessionTimeoutId);
    if (sessionWarningId) clearTimeout(sessionWarningId);
    
    // Remove warning modal if exists
    const modal = document.getElementById('session-warning-modal');
    if (modal) modal.remove();
    
    // Clear session
    localStorage.removeItem('agrismart_current_user');
    
    // Show logout message
    alert('Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.');
    
    // Redirect to login
    window.location.href = 'LOGIN/login.html';
}

// Update session timeout when setting changes
function updateSessionTimeout(minutes) {
    const mins = parseInt(minutes);
    currentSettings.security.sessionTimeout = mins;
    startSessionTimer(mins);
    
    if (mins === 0) {
        console.log('⏱️ Session timeout disabled - Tetap Terhubung');
        showNotification('Sesi akan tetap terhubung tanpa batas waktu', 'info');
    } else {
        console.log(`⏱️ Session timeout updated: ${mins} minutes`);
    }
}

// ============================================
// PUSH NOTIFICATION FUNCTIONS
// ============================================

let pushNotificationEnabled = false;

function initPushNotification() {
    // Check if push notification is supported
    if (!('Notification' in window)) {
        console.log('❌ Browser tidak mendukung Push Notification');
        const pushToggle = document.querySelector('[data-setting="push-notification"]');
        if (pushToggle) {
            pushToggle.style.opacity = '0.5';
            pushToggle.style.pointerEvents = 'none';
        }
        return;
    }
    
    // Check current permission
    if (Notification.permission === 'granted') {
        pushNotificationEnabled = true;
        currentSettings.notification.push = true;
    }
    
    console.log(`🔔 Push Notification: ${Notification.permission}`);
}

async function togglePushNotification(element) {
    // Check if supported
    if (!('Notification' in window)) {
        showNotification('Browser tidak mendukung Push Notification', 'error');
        return;
    }
    
    if (Notification.permission === 'denied') {
        showNotification('Push Notification diblokir oleh browser. Silakan aktifkan di pengaturan browser.', 'error');
        element.classList.remove('active');
        return;
    }
    
    if (Notification.permission === 'default') {
        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            element.classList.add('active');
            pushNotificationEnabled = true;
            currentSettings.notification.push = true;
            showNotification('Push Notification diaktifkan!', 'success');
            
            // Show test notification
            showTestPushNotification();
        } else {
            element.classList.remove('active');
            pushNotificationEnabled = false;
            currentSettings.notification.push = false;
            showNotification('Push Notification ditolak', 'warning');
        }
    } else if (Notification.permission === 'granted') {
        // Toggle on/off
        const isActive = element.classList.contains('active');
        
        if (isActive) {
            element.classList.remove('active');
            pushNotificationEnabled = false;
            currentSettings.notification.push = false;
            showNotification('Push Notification dinonaktifkan', 'info');
        } else {
            element.classList.add('active');
            pushNotificationEnabled = true;
            currentSettings.notification.push = true;
            showNotification('Push Notification diaktifkan!', 'success');
            showTestPushNotification();
        }
    }
}

function showTestPushNotification() {
    if (Notification.permission === 'granted') {
        const notification = new Notification('🌱 AgriSmart', {
            body: 'Push Notification berhasil diaktifkan! Anda akan menerima alert sensor di sini.',
            icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%232c7a2c"/><path fill="%23ffffff" d="M50 20 Q70 50 50 80 Q30 50 50 20 Z"/></svg>',
            badge: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%232c7a2c"/></svg>',
            tag: 'agrismart-test',
            requireInteraction: false
        });
        
        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }
}

// Function to send push notification (called from monitoring.js)
function sendPushNotification(title, message, type = 'info') {
    if (!pushNotificationEnabled || Notification.permission !== 'granted') {
        return false;
    }
    
    let icon = '🌱';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '🚨';
    if (type === 'success') icon = '✅';
    
    const notification = new Notification(`${icon} AgriSmart - ${title}`, {
        body: message,
        icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%232c7a2c"/><path fill="%23ffffff" d="M50 20 Q70 50 50 80 Q30 50 50 20 Z"/></svg>',
        tag: `agrismart-${type}-${Date.now()}`,
        requireInteraction: type === 'error'
    });
    
    // Auto close after 8 seconds (except errors)
    if (type !== 'error') {
        setTimeout(() => notification.close(), 8000);
    }
    
    return true;
}

// Make functions globally available
window.extendSession = extendSession;
window.handleSessionTimeout = handleSessionTimeout;
window.togglePushNotification = togglePushNotification;
window.sendPushNotification = sendPushNotification;
window.updateSessionTimeout = updateSessionTimeout;
// ============================================
// DEVICE MANAGEMENT FUNCTIONS
// ============================================

const DEVICES_KEY = 'agrismart_devices';

// Get current user's devices
function getUserDevices() {
    const user = JSON.parse(localStorage.getItem('agrismart_current_user') || '{}');
    const userId = user.userId;
    
    if (!userId) return { sprinklers: [], cameras: [] };
    
    const allDevices = JSON.parse(localStorage.getItem(DEVICES_KEY) || '{}');
    return allDevices[userId] || { sprinklers: [], cameras: [] };
}

// Save devices for current user
function saveUserDevices(devices) {
    const user = JSON.parse(localStorage.getItem('agrismart_current_user') || '{}');
    const userId = user.userId;
    
    if (!userId) return false;
    
    const allDevices = JSON.parse(localStorage.getItem(DEVICES_KEY) || '{}');
    allDevices[userId] = devices;
    localStorage.setItem(DEVICES_KEY, JSON.stringify(allDevices));
    return true;
}

// Generate Device ID
function generateDeviceId(type) {
    const prefix = type === 'sprinkler' ? 'SPR' : 'CAM';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${id}`;
}

// Render all devices
function renderDevices() {
    const devices = getUserDevices();
    renderSprinklerDevices(devices.sprinklers);
    renderCameraDevices(devices.cameras);
}

// Render Sprinkler Devices
function renderSprinklerDevices(sprinklers) {
    const container = document.getElementById('sprinkler-device-list');
    const emptyState = document.getElementById('sprinkler-empty');
    
    if (!container) return;
    
    // Clear existing cards (except empty state)
    const existingCards = container.querySelectorAll('.device-card');
    existingCards.forEach(card => card.remove());
    
    if (sprinklers.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    sprinklers.forEach((device, index) => {
        const card = createDeviceCard(device, 'sprinkler', index);
        container.appendChild(card);
    });
}

// Render Camera Devices
function renderCameraDevices(cameras) {
    const container = document.getElementById('camera-device-list');
    const emptyState = document.getElementById('camera-empty');
    
    if (!container) return;
    
    // Clear existing cards (except empty state)
    const existingCards = container.querySelectorAll('.device-card');
    existingCards.forEach(card => card.remove());
    
    if (cameras.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    cameras.forEach((device, index) => {
        const card = createDeviceCard(device, 'camera', index);
        container.appendChild(card);
    });
}

// Create Device Card HTML
function createDeviceCard(device, type, index) {
    const card = document.createElement('div');
    card.className = 'device-card';
    card.dataset.type = type;
    card.dataset.index = index;
    
    const isOnline = Math.random() > 0.3; // Simulate online status
    const statusClass = isOnline ? 'online' : 'offline';
    const statusText = isOnline ? 'Online' : 'Offline';
    const icon = type === 'sprinkler' ? 'fa-tint' : 'fa-video';
    
    card.innerHTML = `
        <div class="device-card-header">
            <div class="device-card-info">
                <h4><i class="fas ${icon}"></i> ${device.name}</h4>
                <div class="device-card-id">${device.deviceId}</div>
            </div>
            <div class="device-status ${statusClass}">
                <span class="device-status-dot"></span>
                ${statusText}
            </div>
        </div>
        <div class="device-card-details">
            ${device.location ? `<p><i class="fas fa-map-marker-alt"></i> ${device.location}</p>` : ''}
            ${device.ip ? `<p><i class="fas fa-network-wired"></i> ${device.ip}</p>` : ''}
            <p><i class="fas fa-clock"></i> Ditambahkan: ${formatDate(device.createdAt)}</p>
        </div>
        <div class="device-card-actions">
            <button class="device-btn device-btn-edit" onclick="openEditDeviceModal('${type}', ${index})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="device-btn device-btn-delete" onclick="openDeleteModal('${type}', ${index})">
                <i class="fas fa-trash"></i> Hapus
            </button>
        </div>
    `;
    
    return card;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Open Add Device Modal
function openAddDeviceModal(type) {
    const modal = document.getElementById('add-device-modal');
    const modalTitle = document.getElementById('modal-title');
    const deviceTypeInput = document.getElementById('device-type');
    const prefixSpan = document.getElementById('device-id-prefix');
    
    if (!modal) return;
    
    // Reset form
    document.getElementById('add-device-form').reset();
    
    // Set type
    deviceTypeInput.value = type;
    
    if (type === 'sprinkler') {
        modalTitle.innerHTML = '<i class="fas fa-tint"></i> Tambah Alat Penyiram';
        prefixSpan.textContent = 'SPR-';
    } else {
        modalTitle.innerHTML = '<i class="fas fa-video"></i> Tambah Kamera';
        prefixSpan.textContent = 'CAM-';
    }
    
    modal.classList.add('show');
}

// Close Add Device Modal
function closeAddDeviceModal() {
    const modal = document.getElementById('add-device-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Handle Add Device Form Submit
function handleAddDevice(event) {
    event.preventDefault();
    
    const type = document.getElementById('device-type').value;
    const idSuffix = document.getElementById('device-id').value.toUpperCase();
    const name = document.getElementById('device-name').value.trim();
    const location = document.getElementById('device-location').value.trim();
    const ip = document.getElementById('device-ip').value.trim();
    
    // Validation - Device ID harus 12 karakter hex (MAC Address)
    if (!idSuffix || idSuffix.length !== 12) {
        showNotification('Device ID harus 12 karakter', 'error');
        return;
    }
    
    // Validate hex characters only (0-9, A-F)
    if (!/^[A-Fa-f0-9]{12}$/.test(idSuffix)) {
        showNotification('Device ID hanya boleh berisi karakter hex (0-9, A-F)', 'error');
        return;
    }
    
    if (!name) {
        showNotification('Nama perangkat wajib diisi', 'error');
        return;
    }
    
    const prefix = type === 'sprinkler' ? 'SPR' : 'CAM';
    const deviceId = `${prefix}-${idSuffix}`;
    
    const devices = getUserDevices();
    const targetArray = type === 'sprinkler' ? devices.sprinklers : devices.cameras;
    
    // Check for duplicate
    const isDuplicate = targetArray.some(d => d.deviceId === deviceId);
    if (isDuplicate) {
        showNotification('Device ID sudah terdaftar!', 'error');
        return;
    }
    
    // Add new device
    const newDevice = {
        deviceId,
        name,
        location: location || null,
        ip: ip || null,
        createdAt: new Date().toISOString()
    };
    
    targetArray.push(newDevice);
    saveUserDevices(devices);
    
    // Close modal and refresh
    closeAddDeviceModal();
    renderDevices();
    showNotification(`Perangkat ${name} berhasil ditambahkan!`, 'success');
}

// Open Edit Device Modal
function openEditDeviceModal(type, index) {
    const modal = document.getElementById('edit-device-modal');
    const devices = getUserDevices();
    const targetArray = type === 'sprinkler' ? devices.sprinklers : devices.cameras;
    const device = targetArray[index];
    
    if (!modal || !device) return;
    
    // Fill form
    document.getElementById('edit-device-index').value = index;
    document.getElementById('edit-device-type').value = type;
    document.getElementById('edit-device-id').value = device.deviceId;
    document.getElementById('edit-device-name').value = device.name;
    document.getElementById('edit-device-location').value = device.location || '';
    document.getElementById('edit-device-ip').value = device.ip || '';
    
    modal.classList.add('show');
}

// Close Edit Device Modal
function closeEditDeviceModal() {
    const modal = document.getElementById('edit-device-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Handle Edit Device Form Submit
function handleEditDevice(event) {
    event.preventDefault();
    
    const index = parseInt(document.getElementById('edit-device-index').value);
    const type = document.getElementById('edit-device-type').value;
    const name = document.getElementById('edit-device-name').value.trim();
    const location = document.getElementById('edit-device-location').value.trim();
    const ip = document.getElementById('edit-device-ip').value.trim();
    
    if (!name) {
        showNotification('Nama perangkat wajib diisi', 'error');
        return;
    }
    
    const devices = getUserDevices();
    const targetArray = type === 'sprinkler' ? devices.sprinklers : devices.cameras;
    
    if (targetArray[index]) {
        targetArray[index].name = name;
        targetArray[index].location = location || null;
        targetArray[index].ip = ip || null;
        targetArray[index].updatedAt = new Date().toISOString();
        
        saveUserDevices(devices);
        closeEditDeviceModal();
        renderDevices();
        showNotification('Perangkat berhasil diperbarui!', 'success');
    }
}

// Delete device variables
let deleteDeviceType = null;
let deleteDeviceIndex = null;

// Open Delete Confirmation Modal
function openDeleteModal(type, index) {
    const modal = document.getElementById('delete-device-modal');
    const devices = getUserDevices();
    const targetArray = type === 'sprinkler' ? devices.sprinklers : devices.cameras;
    const device = targetArray[index];
    
    if (!modal || !device) return;
    
    deleteDeviceType = type;
    deleteDeviceIndex = index;
    
    document.getElementById('delete-device-name').textContent = device.name;
    document.getElementById('delete-device-id').textContent = device.deviceId;
    
    modal.classList.add('show');
}

// Close Delete Modal
function closeDeleteModal() {
    const modal = document.getElementById('delete-device-modal');
    if (modal) {
        modal.classList.remove('show');
    }
    deleteDeviceType = null;
    deleteDeviceIndex = null;
}

// Confirm Delete Device
function confirmDeleteDevice() {
    if (deleteDeviceType === null || deleteDeviceIndex === null) return;
    
    const devices = getUserDevices();
    const targetArray = deleteDeviceType === 'sprinkler' ? devices.sprinklers : devices.cameras;
    const deviceName = targetArray[deleteDeviceIndex]?.name;
    
    targetArray.splice(deleteDeviceIndex, 1);
    saveUserDevices(devices);
    
    closeDeleteModal();
    renderDevices();
    showNotification(`Perangkat ${deviceName} berhasil dihapus!`, 'success');
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
        toast.querySelector('i').className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize devices on page load
document.addEventListener('DOMContentLoaded', function() {
    // Render devices after a short delay to ensure DOM is ready
    setTimeout(renderDevices, 100);
});

// Make functions globally available
window.openAddDeviceModal = openAddDeviceModal;
window.closeAddDeviceModal = closeAddDeviceModal;
window.handleAddDevice = handleAddDevice;
window.openEditDeviceModal = openEditDeviceModal;
window.closeEditDeviceModal = closeEditDeviceModal;
window.handleEditDevice = handleEditDevice;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDeleteDevice = confirmDeleteDevice;
window.renderDevices = renderDevices;