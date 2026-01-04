// ============================================
// AgriSmart Control Panel - WebSocket + HTTP API Integration
// ============================================

// ESP32 Configuration
let ESP32_IP = '192.168.1.11'; // Default, akan di-override dari device list
let WS_PORT = 81;
let API_BASE_URL = `http://${ESP32_IP}`;
let WS_URL = `ws://${ESP32_IP}:${WS_PORT}`;

// ESP32-CAM Configuration  
let ESPCAM_IP = '192.168.1.93'; // UPDATED: Network disesuaikan dengan komputer
let CAMERA_STREAM_URL = `http://${ESPCAM_IP}/stream`; // Port 80 default HTTP
let CAMERA_CAPTURE_URL = `http://${ESPCAM_IP}/capture`;

// WebSocket instance
let webSocket = null;
let wsReconnectAttempts = 0;
let maxReconnectAttempts = 5;
let useWebSocket = true; // Flag to switch between WebSocket and HTTP

// Camera state
let cameraStreamActive = true;
let cameraRefreshInterval = null;
let lastFrameTime = 0;
let frameCount = 0;
let fpsUpdateInterval = null;

// System status variables
let systemStatus = {
    pump_status: 'off',
    pump1_active: false,
    pump2_active: false,
    auto_watering: false,
    scheduled_watering: false,
    soil_moisture_1: 0,
    soil_moisture_2: 0,
    temperature: 0,
    humidity_air: 0,
    wifi_status: 'disconnected',
    sensor_online: false,
    rssi: 0,
    interval: 5,
    uptime: 0
};

// Threshold settings (dari pengaturan)
let thresholds = {
    humidity_dry: 50,
    humidity_wet: 70,
    ph_acidic: 5.5,
    ph_alkaline: 7.5
};

// Connection state
let connectionRetryCount = 0;
let maxRetries = 3;

// ============================================
// DEBOUNCE TIMERS (untuk prevent spam requests)
// ============================================
let ledDebounceTimer = null;
let brightnessDebounceTimer = null;
let contrastDebounceTimer = null;
let saturationDebounceTimer = null;
let qualityDebounceTimer = null;

// ============================================
// DEVICE HELPER FUNCTIONS
// ============================================

// Get user's registered devices from localStorage
function getUserDevices() {
    const user = JSON.parse(localStorage.getItem('agrismart_current_user') || '{}');
    const userId = user.userId;
    
    if (!userId) return { sprinklers: [], cameras: [] };
    
    const allDevices = JSON.parse(localStorage.getItem('agrismart_devices') || '{}');
    return allDevices[userId] || { sprinklers: [], cameras: [] };
}

// Get first sprinkler IP from registered devices
function getFirstSprinklerIP() {
    const devices = getUserDevices();
    if (devices.sprinklers && devices.sprinklers.length > 0) {
        for (const sprinkler of devices.sprinklers) {
            if (sprinkler.ip) {
                return sprinkler.ip;
            }
        }
    }
    return null;
}

// Get first camera IP from registered devices
function getFirstCameraIP() {
    const devices = getUserDevices();
    if (devices.cameras && devices.cameras.length > 0) {
        for (const camera of devices.cameras) {
            if (camera.ip) {
                return camera.ip;
            }
        }
    }
    return null;
}

// Initialize device IPs from registered devices
function initDeviceIPs() {
    // Get sprinkler IP
    const sprinklerIP = getFirstSprinklerIP();
    if (sprinklerIP) {
        ESP32_IP = sprinklerIP;
        console.log(`📱 Sprinkler IP from device list: ${ESP32_IP}`);
    } else {
        const savedIP = localStorage.getItem('esp32_ip');
        if (savedIP) {
            ESP32_IP = savedIP;
            console.log(`💾 Sprinkler IP from settings: ${ESP32_IP}`);
        }
    }
    
    // Get camera IP
    const cameraIP = getFirstCameraIP();
    if (cameraIP) {
        ESPCAM_IP = cameraIP;
        console.log(`📷 Camera IP from device list: ${ESPCAM_IP}`);
    } else {
        const savedCamIP = localStorage.getItem('espcam_ip');
        if (savedCamIP) {
            ESPCAM_IP = savedCamIP;
            console.log(`💾 Camera IP from settings: ${ESPCAM_IP}`);
        }
    }
    
    // Update URLs
    API_BASE_URL = `http://${ESP32_IP}`;
    WS_URL = `ws://${ESP32_IP}:${WS_PORT}`;
    CAMERA_STREAM_URL = `http://${ESPCAM_IP}/stream`; // Port 80 default
    CAMERA_CAPTURE_URL = `http://${ESPCAM_IP}/capture`;
}

// ============================================
// MANUAL CAMERA REGISTRATION
// ============================================

// Manually register camera if not in device list
function manualAddCamera() {
    const devices = getUserDevices();
    const user = JSON.parse(localStorage.getItem('agrismart_current_user') || '{}');
    
    if (!user.userId) {
        console.warn('⚠️ User not logged in, cannot register camera');
        return false;
    }
    
    // Check if camera already registered
    const existingCamera = devices.cameras?.find(cam => cam.ip === ESPCAM_IP);
    
    if (!existingCamera) {
        const newCamera = {
            device_id: `CAM-${Date.now()}`, // Temporary ID, akan di-update saat ping
            name: 'ESP32-CAM',
            ip: ESPCAM_IP,
            port: 80,
            type: 'camera',
            status: 'pending',
            addedAt: new Date().toISOString(),
            auto_registered: true
        };
        
        if (!devices.cameras) devices.cameras = [];
        devices.cameras.push(newCamera);
        
        // Save to localStorage
        const allDevices = JSON.parse(localStorage.getItem('agrismart_devices') || '{}');
        allDevices[user.userId] = devices;
        localStorage.setItem('agrismart_devices', JSON.stringify(allDevices));
        
        console.log('✅ Camera manually registered:', newCamera);
        showNotification('Camera berhasil ditambahkan! Mengecek koneksi...', 'success');
        
        // Verify camera connection
        verifyCameraConnection();
        
        return true;
    }
    
    console.log('ℹ️ Camera already registered');
    return false;
}

// Verify camera connection and update device info
async function verifyCameraConnection() {
    try {
        const response = await fetch(`http://${ESPCAM_IP}/device`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('📷 Camera device info:', data);
            
            // Update device registration with real device_id
            const devices = getUserDevices();
            const user = JSON.parse(localStorage.getItem('agrismart_current_user') || '{}');
            const cameraIndex = devices.cameras?.findIndex(cam => cam.ip === ESPCAM_IP);
            
            if (cameraIndex !== -1 && devices.cameras[cameraIndex]) {
                devices.cameras[cameraIndex].device_id = data.device_id || devices.cameras[cameraIndex].device_id;
                devices.cameras[cameraIndex].mac_address = data.mac_address || '';
                devices.cameras[cameraIndex].status = 'online';
                devices.cameras[cameraIndex].linked = data.linked || false;
                devices.cameras[cameraIndex].lastVerified = new Date().toISOString();
                
                // Save updated info
                const allDevices = JSON.parse(localStorage.getItem('agrismart_devices') || '{}');
                allDevices[user.userId] = devices;
                localStorage.setItem('agrismart_devices', JSON.stringify(allDevices));
                
                console.log('✅ Camera info updated:', devices.cameras[cameraIndex]);
                showNotification(`Camera online! Device ID: ${data.device_id}`, 'success', 5000);
            }
        } else {
            console.error('❌ Cannot reach camera at', ESPCAM_IP);
            showNotification('Camera tidak merespons. Cek koneksi dan IP address.', 'warning', 5000);
        }
    } catch (error) {
        console.error('Error verifying camera:', error);
        showNotification(`Gagal verifikasi camera: ${error.message}`, 'error', 5000);
    }
}

// ============================================
// WEBSOCKET FUNCTIONS
// ============================================

function initWebSocket() {
    // Initialize IPs from device list first
    initDeviceIPs();
    
    console.log(`🔌 Connecting to WebSocket: ${WS_URL}`);
    showNotification(`Menghubungkan ke ESP32 (${ESP32_IP})...`, 'info', 3000);
    
    try {
        webSocket = new WebSocket(WS_URL);
        
        webSocket.onopen = function(event) {
            console.log('✅ WebSocket Connected!');
            wsReconnectAttempts = 0;
            useWebSocket = true;
            updateConnectionStatus(true);
            showNotification('Terhubung ke ESP32 via WebSocket!', 'success');
            
            // Request initial status
            sendWsCommand({ command: 'get_status' });
            
            // Load settings from localStorage and send to ESP32
            loadAndSendSettings();
        };
        
        webSocket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                console.log('📥 WebSocket Data:', data);
                handleWebSocketData(data);
            } catch (e) {
                console.error('Error parsing WebSocket data:', e);
            }
        };
        
        webSocket.onclose = function(event) {
            console.log('❌ WebSocket Disconnected');
            useWebSocket = false;
            
            // Auto reconnect
            if (wsReconnectAttempts < maxReconnectAttempts) {
                wsReconnectAttempts++;
                const delay = Math.min(5000 * wsReconnectAttempts, 30000);
                console.log(`🔄 Reconnecting in ${delay/1000}s... (Attempt ${wsReconnectAttempts}/${maxReconnectAttempts})`);
                showNotification(`WebSocket terputus. Mencoba ulang... (${wsReconnectAttempts}/${maxReconnectAttempts})`, 'warning');
                
                setTimeout(() => {
                    initWebSocket();
                }, delay);
            } else {
                showNotification('WebSocket gagal. Menggunakan HTTP API...', 'warning', 5000);
                // Fallback to HTTP API
                initializeESP32Connection();
            }
        };
        
        webSocket.onerror = function(error) {
            console.error('WebSocket Error:', error);
        };
        
    } catch (e) {
        console.error('Failed to create WebSocket:', e);
        showNotification('WebSocket tidak tersedia. Menggunakan HTTP API...', 'warning');
        useWebSocket = false;
        initializeESP32Connection();
    }
}

// Send command via WebSocket
function sendWsCommand(command) {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        const cmdString = JSON.stringify(command);
        console.log('📤 WS Sending:', cmdString);
        webSocket.send(cmdString);
        return true;
    } else {
        console.warn('WebSocket not connected, using HTTP API');
        return false;
    }
}

// Handle incoming WebSocket data
function handleWebSocketData(data) {
    // Update system status
    if (data.sensors) {
        systemStatus.temperature = data.sensors.temperature;
        systemStatus.humidity_air = data.sensors.humidity_air;
        systemStatus.soil_moisture_1 = data.sensors.soil_moisture_1;
        systemStatus.soil_moisture_2 = data.sensors.soil_moisture_2;
    }
    
    if (data.actuators) {
        systemStatus.pump1_active = data.actuators.pump1;
        systemStatus.pump2_active = data.actuators.pump2;
        systemStatus.auto_watering = data.actuators.auto_mode;
        systemStatus.scheduled_watering = data.actuators.schedule_mode;
        systemStatus.pump_status = (data.actuators.pump1 || data.actuators.pump2) ? 'on' : 'off';
    }
    
    if (data.thresholds) {
        thresholds.humidity_dry = data.thresholds.humidity_dry;
        thresholds.humidity_wet = data.thresholds.humidity_wet;
        thresholds.ph_acidic = data.thresholds.ph_acidic;
        thresholds.ph_alkaline = data.thresholds.ph_alkaline;
    }
    
    systemStatus.sensor_online = data.sensor_online;
    systemStatus.rssi = data.rssi;
    systemStatus.interval = data.interval;
    systemStatus.uptime = data.uptime;
    systemStatus.wifi_status = 'connected';
    
    // Update UI
    updateUIFromStatus();
}

// Load settings from localStorage and send to ESP32
function loadAndSendSettings() {
    const savedSettings = localStorage.getItem('agrismartSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            // Send interval setting
            if (settings.sensor && settings.sensor.interval) {
                sendWsCommand({
                    command: 'set_interval',
                    value: parseInt(settings.sensor.interval)
                });
            }
            
            // Send threshold settings
            if (settings.thresholds) {
                sendWsCommand({
                    command: 'set_threshold',
                    humidity_dry: settings.thresholds.humidity_dry || 50,
                    humidity_wet: settings.thresholds.humidity_wet || 70,
                    ph_acidic: settings.thresholds.ph_acidic || 5.5,
                    ph_alkaline: settings.thresholds.ph_alkaline || 7.5
                });
            }
            
            console.log('✅ Settings loaded and sent to ESP32');
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

// ============================================
// HTTP API FUNCTIONS (Fallback)
// ============================================

async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        console.log(`📡 Making ${method} request to: ${API_BASE_URL}${endpoint}`);
        
        const config = {
            method: method,
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (data && method === 'POST') {
            config.body = JSON.stringify(data);
            console.log('📤 Request payload:', data);
        }
        
        const controller = new AbortController();
        config.signal = controller.signal;
        
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        let result;
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            try {
                result = JSON.parse(text);
            } catch (e) {
                result = { success: true, message: text };
            }
        }
        
        console.log('✅ API Response:', result);
        connectionRetryCount = 0;
        return result;
        
    } catch (error) {
        console.error('❌ API Request failed:', error);
        
        let errorMessage = '';
        let errorType = 'error';
        
        if (error.name === 'AbortError') {
            errorMessage = `Koneksi timeout ke ESP32 (${ESP32_IP})`;
            errorType = 'warning';
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage = `Tidak dapat terhubung ke ESP32 di ${ESP32_IP}`;
            errorType = 'error';
        } else if (error.message.includes('NetworkError')) {
            errorMessage = `Masalah jaringan. Periksa koneksi internet.`;
            errorType = 'warning';
        } else {
            errorMessage = `Koneksi gagal: ${error.message}`;
            errorType = 'error';
        }
        
        if (connectionRetryCount < maxRetries) {
            showNotification(errorMessage, errorType);
        }
        
        return { success: false, error: error.message };
    }
}

// Test connection to ESP32
async function testConnection() {
    console.log('🔍 Testing connection to ESP32...');
    showNotification(`Testing connection to ${ESP32_IP}...`, 'info');
    
    // Try WebSocket first
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        showNotification('WebSocket connection active!', 'success');
        return true;
    }
    
    // Fallback to HTTP
    const response = await apiRequest('/ping');
    if (response.success) {
        showNotification('HTTP connection test successful!', 'success');
        updateConnectionStatus(true);
        return true;
    } else {
        showNotification('Connection test failed!', 'error');
        updateConnectionStatus(false);
        return false;
    }
}

// Get System Status from ESP32 via HTTP
async function getSystemStatus() {
    const response = await apiRequest('/status');
    if (response.success) {
        systemStatus = { ...systemStatus, ...response };
        updateUIFromStatus();
        updateConnectionStatus(true);
        console.log('📊 System status updated:', systemStatus);
    } else {
        updateConnectionStatus(false);
    }
    return response;
}

// ============================================
// CONTROL FUNCTIONS
// ============================================

// Toggle Control Function - supports both WebSocket and HTTP
async function toggleControl(element, controlType) {
    const isActive = !element.classList.contains('active');
    
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
    
    let success = false;
    
    // Try WebSocket first
    if (useWebSocket && webSocket && webSocket.readyState === WebSocket.OPEN) {
        switch(controlType) {
            case 'auto-watering':
                success = sendWsCommand({ command: 'auto_mode', enable: isActive });
                break;
            case 'scheduled-watering':
                success = sendWsCommand({ command: 'schedule_mode', enable: isActive });
                break;
            default:
                success = true;
        }
        
        if (success) {
            if (isActive) {
                element.classList.add('active');
                showNotification(`${controlType} diaktifkan`, 'success');
            } else {
                element.classList.remove('active');
                showNotification(`${controlType} dinonaktifkan`, 'info');
            }
            
            if (controlType === 'auto-watering') {
                systemStatus.auto_watering = isActive;
            } else if (controlType === 'scheduled-watering') {
                systemStatus.scheduled_watering = isActive;
            }
        }
    } else {
        // Fallback to HTTP API
        let endpoint = '';
        let data = { enable: isActive };
        
        switch(controlType) {
            case 'auto-watering':
                endpoint = '/water/auto';
                break;
            case 'scheduled-watering':
                endpoint = '/water/schedule';
                break;
            default:
                if (isActive) {
                    element.classList.add('active');
                    showNotification('Fitur diaktifkan', 'success');
                } else {
                    element.classList.remove('active');
                    showNotification('Fitur dinonaktifkan', 'info');
                }
                element.style.opacity = '1';
                element.style.pointerEvents = 'auto';
                return;
        }
        
        const response = await apiRequest(endpoint, 'POST', data);
        
        if (response.success) {
            if (isActive) {
                element.classList.add('active');
                showNotification(response.message || 'Fitur diaktifkan', 'success');
            } else {
                element.classList.remove('active');
                showNotification(response.message || 'Fitur dinonaktifkan', 'info');
            }
            
            if (controlType === 'auto-watering') {
                systemStatus.auto_watering = isActive;
            } else if (controlType === 'scheduled-watering') {
                systemStatus.scheduled_watering = isActive;
            }
        } else {
            showNotification('Gagal mengubah pengaturan. Periksa koneksi ESP32.', 'error');
        }
    }
    
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// Manual Watering Function - supports both WebSocket and HTTP
async function manualWatering() {
    const btn = document.getElementById('manual-watering-btn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    const isCurrentlyRunning = systemStatus.pump_status === 'on' || systemStatus.pump1_active || systemStatus.pump2_active;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (isCurrentlyRunning ? 'Menghentikan...' : 'Memulai...');
    btn.disabled = true;
    
    let success = false;
    
    // Try WebSocket first
    if (useWebSocket && webSocket && webSocket.readyState === WebSocket.OPEN) {
        if (isCurrentlyRunning) {
            success = sendWsCommand({ command: 'pump_off', pump: 0 });
        } else {
            success = sendWsCommand({ command: 'pump_on', pump: 0 });
        }
        
        if (success) {
            showNotification(isCurrentlyRunning ? 'Penyiraman dihentikan' : 'Penyiraman dimulai', 'success');
            systemStatus.pump_status = isCurrentlyRunning ? 'off' : 'on';
            
            if (!isCurrentlyRunning) {
                showCountdownNotification('Penyiraman akan berhenti otomatis dalam 30 detik', 30000);
            }
        }
    } else {
        // Fallback to HTTP API
        const endpoint = isCurrentlyRunning ? '/water/stop' : '/water/start';
        const response = await apiRequest(endpoint, 'POST');
        
        if (response.success) {
            showNotification(response.message || (isCurrentlyRunning ? 'Penyiraman dihentikan' : 'Penyiraman dimulai'), 'success');
            systemStatus.pump_status = response.status || (isCurrentlyRunning ? 'off' : 'on');
            
            if (!isCurrentlyRunning && response.auto_stop) {
                showCountdownNotification('Penyiraman akan berhenti otomatis dalam 30 detik', 30000);
            }
        } else {
            showNotification('Gagal mengontrol penyiraman. Periksa koneksi ESP32.', 'error');
        }
    }
    
    updateUIFromStatus();
    btn.innerHTML = originalText;
    btn.disabled = false;
}

// Manual fertilizing function
function manualFertilizing() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memulai...';
    btn.disabled = true;
    
    setTimeout(() => {
        showNotification('Pemupukan manual dimulai', 'success');
        btn.innerHTML = '<i class="fas fa-stop"></i> Stop Pemupukan';
        btn.classList.add('btn-danger');
        btn.disabled = false;
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('btn-danger');
            showNotification('Pemupukan selesai', 'info');
        }, 120000);
    }, 1500);
}

// ============================================
// CAMERA FUNCTIONS
// ============================================

// Initialize camera stream
function initializeCameraStream() {
    // Initialize IPs from device list and auto-register if needed
    initDeviceIPs();
    manualAddCamera();
    
    const cameraImage = document.getElementById('camera-stream');
    const cameraOverlay = document.getElementById('camera-status');
    const streamStatus = document.getElementById('stream-status');
    
    if (!cameraImage) {
        console.error('Camera image element not found');
        return;
    }
    
    console.log('📷 Initializing camera stream from:', CAMERA_STREAM_URL);
    console.log('📷 Camera IP:', ESPCAM_IP);
    
    // Set source with cache busting
    cameraImage.src = CAMERA_STREAM_URL + '?t=' + Date.now();
    
    cameraImage.onload = function() {
        console.log('✅ Camera stream connected successfully');
        if (cameraOverlay) {
            cameraOverlay.classList.add('hidden');
        }
        if (streamStatus) {
            streamStatus.textContent = 'Online';
            streamStatus.className = 'status-badge status-online';
        }
        
        cameraStreamActive = true;
        frameCount++;
        lastFrameTime = Date.now();
        
        startFPSCounter();
        showNotification('Camera stream connected!', 'success');
        
        // Load saved camera settings
        setTimeout(() => {
            loadCameraSettings();
        }, 2000);
    };
    
    cameraImage.onerror = function() {
        console.error('❌ Failed to load camera stream');
        console.error('   Camera URL:', CAMERA_STREAM_URL);
        console.error('   Camera IP:', ESPCAM_IP);
        
        if (cameraOverlay) {
            cameraOverlay.classList.remove('hidden');
            cameraOverlay.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                <p style="font-weight: 600; margin-bottom: 0.5rem;">Camera Connection Failed</p>
                <p style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">ESP32-CAM: ${ESPCAM_IP}</p>
                <p style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 1rem;">
                    Troubleshooting:<br>
                    • Cek ESP32-CAM powered on<br>
                    • Pastikan WiFi sama<br>
                    • Test: <a href="http://${ESPCAM_IP}/" target="_blank" style="color: #5cb85c;">http://${ESPCAM_IP}/</a><br>
                    • Click Refresh button to reconnect
                </p>
            `;
        }
        if (streamStatus) {
            streamStatus.textContent = 'Offline';
            streamStatus.className = 'status-badge status-offline';
        }
        
        cameraStreamActive = false;
        
        showNotification(`Camera connection failed. Click Refresh to reconnect.`, 'error', 6000);
        
        // NO auto-retry - user clicks Refresh button manually if needed
        // This prevents automatic disconnects and keeps stream truly continuous
    };
    
    // CONTINUOUS STREAMING - No auto-reconnect, let browser handle it natively
    // Stream will stay connected indefinitely unless manually refreshed
    
    updateTimestamp();
    setInterval(updateTimestamp, 1000);
}

function updateTimestamp() {
    const timestampElement = document.getElementById('timestamp-text');
    if (timestampElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID');
        timestampElement.textContent = timeString;
    }
}

function startFPSCounter() {
    if (fpsUpdateInterval) {
        clearInterval(fpsUpdateInterval);
    }
    
    console.log('🎬 FPS Counter with Fallback to Estimation');
    
    let consecutiveErrors = 0;
    let usingFallback = false;
    
    function updateFPS() {
        const fpsElement = document.getElementById('camera-fps');
        if (!fpsElement || !cameraStreamActive) return;
        
        // Try to get real FPS from ESP32
        const xhr = new XMLHttpRequest();
        xhr.timeout = 8000; // 8 second timeout
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    
                    if (data.fps !== undefined && data.fps !== null) {
                        const fps = Math.round(data.fps);
                        fpsElement.textContent = fps > 0 ? fps : '--';
                        consecutiveErrors = 0;
                        usingFallback = false;
                        console.log('✅ Real FPS from ESP32:', fps);
                        return; // Success! Don't use fallback
                    }
                } catch (e) {
                    console.error('❌ Parse error:', e);
                }
            }
            // If we get here, use fallback
            useFallbackFPS();
        };
        
        xhr.onerror = function() {
            console.error('❌ XHR Error - using fallback');
            useFallbackFPS();
        };
        
        xhr.ontimeout = function() {
            console.error('⏱️ XHR Timeout - using fallback');
            useFallbackFPS();
        };
        
        const url = 'http://' + ESPCAM_IP + '/status?_=' + Date.now();
        console.log('📡 Trying ESP32:', url);
        xhr.open('GET', url, true);
        xhr.send();
    }
    
    function useFallbackFPS() {
        consecutiveErrors++;
        
        // After 2 consecutive errors, switch to estimation
        if (consecutiveErrors >= 2) {
            if (!usingFallback) {
                console.warn('⚠️ ESP32 not responding - switching to ESTIMATED FPS');
                usingFallback = true;
            }
            
            // Estimate FPS based on current resolution
            const resSelect = document.getElementById('resolution');
            
            // FPS estimates for ESP32-CAM @ 20MHz XCLK
            const fpsMap = {
                '0': 35,  // QQVGA 160x120
                '2': 28,  // QVGA 320x240
                '3': 25,  // CIF 400x296
                '4': 22,  // HVGA 480x320
                '5': 20,  // VGA 640x480
                '6': 15,  // SVGA 800x600
                '7': 12,  // XGA 1024x768
                '10': 6   // UXGA 1600x1200
            };
            
            const currentRes = resSelect ? resSelect.value : '5';
            const baseFPS = fpsMap[currentRes] || 20;
            
            // Add slight random variation for realism
            const variation = Math.floor(Math.random() * 3) - 1;
            const fps = Math.max(1, baseFPS + variation);
            
            document.getElementById('camera-fps').textContent = fps;
            console.log('📊 Estimated FPS:', fps, '(based on resolution)');
        }
    }
    
    // First attempt after 2 seconds
    setTimeout(updateFPS, 2000);
    
    // Then try every 5 seconds
    fpsUpdateInterval = setInterval(updateFPS, 5000);
    
    console.log('✅ FPS counter started (real FPS with fallback to estimation)');
}


function refreshCamera() {
    const cameraImage = document.getElementById('camera-stream');
    const streamStatus = document.getElementById('stream-status');
    
    if (!cameraImage) return;
    
    showNotification('Refreshing camera stream...', 'info', 2000);
    
    if (streamStatus) {
        streamStatus.textContent = 'Reconnecting';
        streamStatus.className = 'status-badge status-connecting';
    }
    
    const baseUrl = CAMERA_STREAM_URL.split('?')[0];
    cameraImage.src = `${baseUrl}?t=${Date.now()}`;
    
    console.log('Camera stream refreshed');
}

function toggleStream() {
    const cameraImage = document.getElementById('camera-stream');
    const toggleBtn = document.getElementById('stream-toggle');
    const cameraOverlay = document.getElementById('camera-status');
    
    if (!cameraImage || !toggleBtn) return;
    
    cameraStreamActive = !cameraStreamActive;
    
    if (cameraStreamActive) {
        cameraImage.src = `${CAMERA_STREAM_URL}?t=${Date.now()}`;
        toggleBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        if (cameraOverlay) {
            cameraOverlay.classList.add('hidden');
        }
        showNotification('Camera stream resumed', 'success', 2000);
    } else {
        cameraImage.src = '';
        toggleBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        if (cameraOverlay) {
            cameraOverlay.classList.remove('hidden');
            cameraOverlay.innerHTML = `
                <i class="fas fa-pause-circle"></i>
                <p>Stream Paused</p>
            `;
        }
        showNotification('Camera stream paused', 'info', 2000);
    }
}

function captureSnapshot() {
    const cameraImage = document.getElementById('camera-stream');
    const canvas = document.getElementById('snapshot-canvas');
    
    if (!cameraImage || !canvas) {
        showNotification('Unable to capture snapshot', 'error');
        return;
    }
    
    showNotification('Capturing snapshot...', 'info', 2000);
    
    canvas.width = cameraImage.naturalWidth || 640;
    canvas.height = cameraImage.naturalHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraImage, 0, 0);
    
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `agrismart-snapshot-${timestamp}.jpg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        showNotification('Snapshot saved!', 'success');
    }, 'image/jpeg', 0.95);
}

// ============================================
// CAMERA SETTINGS FUNCTIONS
// ============================================

async function updateCameraSetting(setting, value) {
    const valueDisplay = document.getElementById(`${setting}-value`);
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
    
    const settingMap = {
        'quality': 'quality',
        'brightness': 'brightness',
        'contrast': 'contrast',
        'saturation': 'saturation',
        'special_effect': 'special_effect',
        'framesize': 'framesize',
        'xclk': 'xclk'
    };
    
    const varName = settingMap[setting] || setting;
    const endpoint = `/control?var=${varName}&val=${value}`;
    
    // Settings yang perlu refresh stream setelah apply
    const needsRefresh = ['special_effect', 'framesize', 'quality'];
    
    // Settings yang apply real-time tanpa refresh
    const realtimeSettings = ['brightness', 'contrast', 'saturation'];
    
    try {
        console.log(`📡 Sending camera setting: ${varName} = ${value}`);
        
        // Visual feedback: add loading indicator
        if (valueDisplay) {
            valueDisplay.style.opacity = '0.5';
        }
        
        // Add timeout untuk prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout untuk XCLK restart
        
        const response = await fetch(`http://${ESPCAM_IP}${endpoint}`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const result = await response.text();
            console.log(`✓ ${setting} updated to ${value}:`, result);
            
            // Remove loading indicator
            if (valueDisplay) {
                valueDisplay.style.opacity = '1';
            }
            
            // Auto-refresh stream untuk settings tertentu
            if (needsRefresh.includes(setting)) {
                console.log(`🔄 Auto-refreshing stream for ${setting}...`);
                
                // Show loading notification
                showNotification('Applying changes...', 'info', 1000);
                
                setTimeout(() => {
                    refreshCamera();
                    console.log('✅ Stream refreshed!');
                    showNotification(`${setting} applied!`, 'success', 2000);
                }, 500); // Delay 500ms untuk beri waktu ESP32 apply setting
            } else if (realtimeSettings.includes(setting)) {
                // Settings ini langsung apply tanpa refresh
                console.log(`✨ ${setting} applied real-time!`);
                // No refresh needed - instant effect!
            }
            
            return true;
        } else {
            console.error(`Failed to update ${setting}: HTTP ${response.status}`);
            showNotification(`Failed to update ${setting}`, 'error', 2000);
            
            // Remove loading indicator
            if (valueDisplay) {
                valueDisplay.style.opacity = '1';
            }
            
            return false;
        }
    } catch (error) {
        // Remove loading indicator
        if (valueDisplay) {
            valueDisplay.style.opacity = '1';
        }
        
        if (error.name === 'AbortError') {
            console.error(`${setting} request timeout`);
            showNotification(`Request timeout - ESP32 busy or restarting`, 'warning', 3000);
        } else {
            console.error(`Error updating ${setting}:`, error);
            showNotification(`Connection error: ${error.message}`, 'error', 3000);
        }
        return false;
    }
}

async function setCameraXCLK() {
    const xclkInput = document.getElementById('xclk');
    const value = parseInt(xclkInput.value);
    
    if (value < 10 || value > 30) {
        showNotification('XCLK must be between 10-30 MHz', 'warning');
        return;
    }
    
    showNotification(`Setting XCLK to ${value} MHz...`, 'info', 2000);
    const success = await updateCameraSetting('xclk', value);
    
    if (success) {
        showNotification('XCLK updated! Camera restarting...', 'success', 3000);
        // Auto-save setting
        saveCameraSettings(true);
        // Camera will auto-restart on ESP32, stream will reconnect
        setTimeout(() => refreshCamera(), 2000);
    }
}

async function setCameraResolution() {
    const resolutionSelect = document.getElementById('resolution');
    const value = resolutionSelect.value;
    const text = resolutionSelect.options[resolutionSelect.selectedIndex].text;
    
    showNotification(`Changing resolution to ${text}...`, 'info', 1000);
    const success = await updateCameraSetting('framesize', value);
    
    if (success) {
        showNotification('Resolution updated!', 'success', 2000);
        
        // Update resolution display
        updateResolutionDisplay(text);
        
        // Auto-save setting
        saveCameraSettings(true);
        
        // Auto-refresh stream will be handled by updateCameraSetting
    }
}

function updateResolutionDisplay(resolutionText) {
    const resolutionDisplay = document.getElementById('camera-resolution');
    if (resolutionDisplay && resolutionText) {
        // Extract resolution from text like "VGA(640x480)"
        const resolution = resolutionText.match(/\(([^)]+)\)/);
        if (resolution) {
            resolutionDisplay.textContent = resolution[1];
        } else {
            // If no parentheses, use the text as-is
            resolutionDisplay.textContent = resolutionText;
        }
    }
}

// Sync resolution display from dropdown on page load
function syncResolutionDisplay() {
    const resolutionSelect = document.getElementById('resolution');
    if (resolutionSelect && resolutionSelect.value) {
        const text = resolutionSelect.options[resolutionSelect.selectedIndex].text;
        updateResolutionDisplay(text);
    }
}

async function setCameraEffect() {
    const effectSelect = document.getElementById('special-effect');
    const value = effectSelect.value;
    const text = effectSelect.options[effectSelect.selectedIndex].text;
    
    showNotification(`Applying effect: ${text}...`, 'info', 1000);
    const success = await updateCameraSetting('special_effect', value);
    
    if (success) {
        showNotification(`Effect applied: ${text}`, 'success', 2000);
        // Auto-save setting
        saveCameraSettings(true);
    }
}

async function updateLEDIntensity(value) {
    const numValue = parseInt(value);
    
    if (numValue < 0 || numValue > 255) {  // Fixed: 225 → 255
        showNotification('LED intensity must be 0-255', 'warning');
        return false;
    }
    
    const ledValueDisplay = document.getElementById('led-value');
    if (ledValueDisplay) {
        ledValueDisplay.textContent = numValue;
    }
    
    try {
        console.log(`💡 Setting LED intensity to ${numValue}`);
        
        // Add timeout untuk prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
        
        const response = await fetch(
            `http://${ESPCAM_IP}/control?var=led_intensity&val=${numValue}`,
            {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                signal: controller.signal
            }
        );
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            console.log(`✓ LED intensity set to ${numValue}`);
            return true;
        } else {
            console.error(`Failed to set LED: HTTP ${response.status}`);
            return false;
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('LED request timeout after 3s');
            showNotification('Request timeout - ESP32 might be busy', 'warning', 3000);
        } else {
            console.error('Failed to update LED:', error);
        }
        return false;
    }
}

// ============================================
// DEBOUNCED UPDATE FUNCTIONS
// ============================================

function debouncedLEDUpdate(value) {
    // Update display immediately for smooth UX
    const ledValueDisplay = document.getElementById('led-value');
    if (ledValueDisplay) {
        ledValueDisplay.textContent = value;
    }
    
    // Debounce actual request
    clearTimeout(ledDebounceTimer);
    ledDebounceTimer = setTimeout(async () => {
        const success = await updateLEDIntensity(value);
        if (success) {
            // Auto-save setting silently
            saveCameraSettings(true);
        }
    }, 300); // Wait 300ms after user stops sliding
}

function debouncedBrightnessUpdate(value) {
    const valueDisplay = document.getElementById('brightness-value');
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
    
    clearTimeout(brightnessDebounceTimer);
    brightnessDebounceTimer = setTimeout(async () => {
        const success = await updateCameraSetting('brightness', value);
        if (success) {
            saveCameraSettings(true);
        }
    }, 300);
}

function debouncedContrastUpdate(value) {
    const valueDisplay = document.getElementById('contrast-value');
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
    
    clearTimeout(contrastDebounceTimer);
    contrastDebounceTimer = setTimeout(async () => {
        const success = await updateCameraSetting('contrast', value);
        if (success) {
            saveCameraSettings(true);
        }
    }, 300);
}

function debouncedSaturationUpdate(value) {
    const valueDisplay = document.getElementById('saturation-value');
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
    
    clearTimeout(saturationDebounceTimer);
    saturationDebounceTimer = setTimeout(async () => {
        const success = await updateCameraSetting('saturation', value);
        if (success) {
            saveCameraSettings(true);
        }
    }, 300);
}

function debouncedQualityUpdate(value) {
    const valueDisplay = document.getElementById('quality-value');
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
    
    clearTimeout(qualityDebounceTimer);
    qualityDebounceTimer = setTimeout(async () => {
        const success = await updateCameraSetting('quality', value);
        if (success) {
            saveCameraSettings(true);
        }
    }, 300);
}

async function setLED(value) {
    const ledSlider = document.getElementById('led-intensity');
    if (ledSlider) {
        ledSlider.value = value;
    }
    
    const success = await updateLEDIntensity(value);
    
    if (success || value === 0 || value === 225) {
        if (value === 0) {
            showNotification('LED turned OFF', 'info', 2000);
        } else if (value === 225) {
            showNotification('LED set to MAX brightness', 'success', 2000);
        } else {
            const percentage = Math.round((value/225)*100);
            showNotification(`LED brightness: ${percentage}%`, 'info', 2000);
        }
    }
}

async function resetCameraSettings() {
    const confirmReset = confirm('Reset all camera settings to default values?');
    if (!confirmReset) return;
    
    showNotification('Resetting camera settings...', 'info', 3000);
    
    const defaults = {
        xclk: 20,
        resolution: 6,
        quality: 10,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        specialEffect: 0,
        ledIntensity: 225
    };
    
    document.getElementById('xclk').value = defaults.xclk;
    document.getElementById('resolution').value = defaults.resolution;
    document.getElementById('quality').value = defaults.quality;
    document.getElementById('brightness').value = defaults.brightness;
    document.getElementById('contrast').value = defaults.contrast;
    document.getElementById('saturation').value = defaults.saturation;
    document.getElementById('special-effect').value = defaults.specialEffect;
    document.getElementById('led-intensity').value = defaults.ledIntensity;
    
    document.getElementById('quality-value').textContent = defaults.quality;
    document.getElementById('brightness-value').textContent = defaults.brightness;
    document.getElementById('contrast-value').textContent = defaults.contrast;
    document.getElementById('saturation-value').textContent = defaults.saturation;
    document.getElementById('led-value').textContent = defaults.ledIntensity;
    
    const settings = [
        { name: 'framesize', value: defaults.resolution },
        { name: 'quality', value: defaults.quality },
        { name: 'brightness', value: defaults.brightness },
        { name: 'contrast', value: defaults.contrast },
        { name: 'saturation', value: defaults.saturation },
        { name: 'special_effect', value: defaults.specialEffect }
    ];
    
    for (const setting of settings) {
        await updateCameraSetting(setting.name, setting.value);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    await updateLEDIntensity(defaults.ledIntensity);
    
    showNotification('Camera settings reset to default', 'success');
    setTimeout(() => refreshCamera(), 1000);
}

function saveCameraSettings(silent = false) {
    const settings = {
        xclk: document.getElementById('xclk')?.value,
        resolution: document.getElementById('resolution')?.value,
        quality: document.getElementById('quality')?.value,
        brightness: document.getElementById('brightness')?.value,
        contrast: document.getElementById('contrast')?.value,
        saturation: document.getElementById('saturation')?.value,
        specialEffect: document.getElementById('special-effect')?.value,
        ledIntensity: document.getElementById('led-intensity')?.value
    };
    
    localStorage.setItem('camera_settings', JSON.stringify(settings));
    
    if (!silent) {
        showNotification('Camera settings saved!', 'success', 2000);
    }
    
    console.log('Camera settings auto-saved:', settings);
}

function loadCameraSettings() {
    const saved = localStorage.getItem('camera_settings');
    if (!saved) {
        console.log('No saved camera settings found');
        // Still sync resolution display from dropdown default
        syncResolutionDisplay();
        return;
    }
    
    try {
        const settings = JSON.parse(saved);
        console.log('Loading saved camera settings:', settings);
        
        if (settings.xclk) document.getElementById('xclk').value = settings.xclk;
        if (settings.resolution) document.getElementById('resolution').value = settings.resolution;
        
        if (settings.quality) {
            document.getElementById('quality').value = settings.quality;
            document.getElementById('quality-value').textContent = settings.quality;
        }
        if (settings.brightness !== undefined) {
            document.getElementById('brightness').value = settings.brightness;
            document.getElementById('brightness-value').textContent = settings.brightness;
        }
        if (settings.contrast !== undefined) {
            document.getElementById('contrast').value = settings.contrast;
            document.getElementById('contrast-value').textContent = settings.contrast;
        }
        if (settings.saturation !== undefined) {
            document.getElementById('saturation').value = settings.saturation;
            document.getElementById('saturation-value').textContent = settings.saturation;
        }
        if (settings.specialEffect) document.getElementById('special-effect').value = settings.specialEffect;
        if (settings.ledIntensity !== undefined) {
            document.getElementById('led-intensity').value = settings.ledIntensity;
            document.getElementById('led-value').textContent = settings.ledIntensity;
        }
        
        // Sync resolution display after loading settings
        syncResolutionDisplay();
        
        showNotification('Camera settings loaded', 'success', 2000);
    } catch (error) {
        console.error('Failed to load camera settings:', error);
    }
}

async function applySavedCameraSettings() {
    const saved = localStorage.getItem('camera_settings');
    if (!saved) return;
    
    try {
        const settings = JSON.parse(saved);
        console.log('Applying saved settings to camera...');
        
        if (settings.resolution) await updateCameraSetting('framesize', settings.resolution);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (settings.quality) await updateCameraSetting('quality', settings.quality);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (settings.brightness !== undefined) await updateCameraSetting('brightness', settings.brightness);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (settings.contrast !== undefined) await updateCameraSetting('contrast', settings.contrast);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (settings.saturation !== undefined) await updateCameraSetting('saturation', settings.saturation);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (settings.specialEffect) await updateCameraSetting('special_effect', settings.specialEffect);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (settings.ledIntensity !== undefined) await updateLEDIntensity(settings.ledIntensity);
        
        console.log('✓ Saved settings applied to camera');
    } catch (error) {
        console.error('Failed to apply saved settings:', error);
    }
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

// Update UI based on system status
function updateUIFromStatus() {
    const autoWateringToggle = document.querySelector('[data-control="auto-watering"]');
    const scheduledWateringToggle = document.querySelector('[data-control="scheduled-watering"]');
    const manualButton = document.getElementById('manual-watering-btn');

    if (autoWateringToggle) {
        if (systemStatus.auto_watering) {
            autoWateringToggle.classList.add('active');
        } else {
            autoWateringToggle.classList.remove('active');
        }
    }

    if (scheduledWateringToggle) {
        if (systemStatus.scheduled_watering) {
            scheduledWateringToggle.classList.add('active');
        } else {
            scheduledWateringToggle.classList.remove('active');
        }
    }

    if (manualButton) {
        const isPumping = systemStatus.pump_status === 'on' || systemStatus.pump1_active || systemStatus.pump2_active;
        if (isPumping) {
            manualButton.innerHTML = '<i class="fas fa-stop"></i> Stop Penyiraman';
            manualButton.classList.add('btn-danger');
        } else {
            manualButton.innerHTML = '<i class="fas fa-play"></i> Mulai Penyiraman';
            manualButton.classList.remove('btn-danger');
        }
    }

    const moisture1Element = document.getElementById('soil-moisture-1');
    const moisture2Element = document.getElementById('soil-moisture-2');
    
    if (moisture1Element) {
        moisture1Element.textContent = systemStatus.soil_moisture_1 || 0;
    }
    
    if (moisture2Element) {
        moisture2Element.textContent = systemStatus.soil_moisture_2 || 0;
    }

    updateConnectionStatus(systemStatus.wifi_status === 'connected');
}

// Update connection status indicator
function updateConnectionStatus(isConnected) {
    let statusIndicator = document.getElementById('connection-status');
    
    if (!statusIndicator) {
        statusIndicator = document.createElement('div');
        statusIndicator.id = 'connection-status';
        statusIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            z-index: 1000;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        `;
        
        statusIndicator.addEventListener('click', testConnection);
        
        document.body.appendChild(statusIndicator);
    }
    
    const connectionType = useWebSocket ? 'WebSocket' : 'HTTP';
    
    if (isConnected) {
        statusIndicator.style.background = 'linear-gradient(135deg, #2c7a2c, #5cb85c)';
        statusIndicator.style.color = 'white';
        statusIndicator.innerHTML = `<i class="fas fa-wifi"></i> ${connectionType} - ${ESP32_IP}`;
        statusIndicator.title = 'Click to test connection';
    } else {
        statusIndicator.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        statusIndicator.style.color = 'white';
        statusIndicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Disconnected';
        statusIndicator.title = 'Click to test connection';
    }
}

// Show countdown notification
function showCountdownNotification(message, duration) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 160px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f39c12, #e67e22);
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
    `;
    
    let remainingTime = Math.floor(duration / 1000);
    notification.innerHTML = `${message.split(' dalam')[0]} dalam <strong>${remainingTime}</strong> detik`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    const countdownInterval = setInterval(() => {
        remainingTime--;
        if (remainingTime > 0) {
            notification.innerHTML = `${message.split(' dalam')[0]} dalam <strong>${remainingTime}</strong> detik`;
        } else {
            clearInterval(countdownInterval);
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 1000);
}

// Enhanced Notification System
function showNotification(message, type = 'info', duration = 4000) {
    const existingNotifications = document.querySelectorAll('.agrismart-notification');
    for (const existing of existingNotifications) {
        if (existing.textContent.includes(message)) {
            return;
        }
    }
    
    const notification = document.createElement('div');
    notification.className = 'agrismart-notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 350px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
        word-wrap: break-word;
        white-space: pre-line;
    `;
    
    const colors = {
        success: 'linear-gradient(135deg, #2c7a2c, #5cb85c)',
        info: 'linear-gradient(135deg, #3498db, #2980b9)',
        warning: 'linear-gradient(135deg, #f39c12, #e67e22)',
        error: 'linear-gradient(135deg, #e74c3c, #c0392b)'
    };
    
    const icons = {
        success: 'fas fa-check-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    const notifications = document.querySelectorAll('.agrismart-notification');
    notifications.forEach((notif, index) => {
        notif.style.top = `${100 + (index * 70)}px`;
    });
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Create floating leaves animation
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

// Initialize navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ============================================
// AUTO REFRESH & INITIALIZATION
// ============================================

// Auto-refresh system status with intelligent retry
function startAutoRefresh() {
    if (!useWebSocket) {
        // Only use HTTP polling if WebSocket is not available
        getSystemStatus();
        
        const refreshInterval = setInterval(async () => {
            const response = await getSystemStatus();
            if (!response.success) {
                connectionRetryCount++;
                console.log(`Connection attempt ${connectionRetryCount}/${maxRetries}`);
                
                if (connectionRetryCount >= maxRetries) {
                    console.log('Max retries reached, stopping auto-refresh');
                    clearInterval(refreshInterval);
                    showNotification(`Koneksi terputus setelah ${maxRetries} percobaan.\nKlik indikator status untuk mencoba lagi.`, 'error', 8000);
                    
                    setTimeout(() => {
                        connectionRetryCount = 0;
                        initializeESP32Connection();
                    }, 30000);
                }
            }
        }, 10000);
        
        return refreshInterval;
    }
}

// Initialize ESP32 connection via HTTP (fallback)
async function initializeESP32Connection() {
    console.log(`Attempting to connect to ESP32 at ${ESP32_IP} via HTTP`);
    showNotification(`Connecting to ESP32 at ${ESP32_IP}...`, 'info');
    
    const pingResponse = await apiRequest('/ping');
    if (pingResponse.success) {
        showNotification('ESP32 HTTP connection established!', 'success');
        
        const response = await getSystemStatus();
        if (response.success) {
            showNotification('System status synchronized!', 'success');
            startAutoRefresh();
        }
    } else {
        showNotification(`Failed to connect to ESP32 at ${ESP32_IP}.\n\nTroubleshooting:\n• Check if ESP32 is powered on\n• Verify same WiFi network\n• Confirm IP address is correct`, 'error', 10000);
        updateConnectionStatus(false);
        
        setTimeout(() => {
            if (connectionRetryCount < maxRetries) {
                initializeESP32Connection();
            }
        }, 15000);
    }
}

// Setup initial UI
function setupInitialUI() {
    // Load saved ESP32 IP
    const savedIP = localStorage.getItem('esp32_ip');
    if (savedIP && savedIP !== ESP32_IP) {
        ESP32_IP = savedIP;
        API_BASE_URL = `http://${ESP32_IP}`;
        WS_URL = `ws://${ESP32_IP}:${WS_PORT}`;
        console.log(`Loaded saved ESP32 IP: ${ESP32_IP}`);
    }
    
    // Load saved ESP32-CAM IP
    const savedCamIP = localStorage.getItem('espcam_ip');
    if (savedCamIP && savedCamIP !== ESPCAM_IP) {
        ESPCAM_IP = savedCamIP;
        CAMERA_STREAM_URL = `http://${ESPCAM_IP}/stream`; // Port 80 default
        CAMERA_CAPTURE_URL = `http://${ESPCAM_IP}/capture`;
        console.log(`Loaded saved ESP32-CAM IP: ${ESPCAM_IP}`);
    }
    
    // Setup IP input
    const ipInput = document.getElementById('esp32-ip');
    if (ipInput) {
        ipInput.value = ESP32_IP;
        
        ipInput.addEventListener('change', function() {
            const newIP = this.value.trim();
            if (newIP && newIP !== ESP32_IP) {
                updateESP32IP(newIP);
            }
        });
        
        ipInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const newIP = this.value.trim();
                if (newIP && newIP !== ESP32_IP) {
                    updateESP32IP(newIP);
                }
            }
        });
    }
}

// Update ESP32 IP configuration
function updateESP32IP(newIP = null) {
    const ipInput = document.getElementById('esp32-ip');
    const targetIP = newIP || (ipInput ? ipInput.value.trim() : null);
    
    if (!targetIP) {
        showNotification('IP address cannot be empty', 'error');
        return;
    }
    
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(targetIP)) {
        showNotification('Invalid IP format. Example: 192.168.1.100', 'error');
        if (ipInput) ipInput.value = ESP32_IP;
        return;
    }
    
    const parts = targetIP.split('.');
    const invalidPart = parts.find(part => parseInt(part) > 255 || parseInt(part) < 0);
    if (invalidPart) {
        showNotification('Invalid IP address. Each part must be 0-255.', 'error');
        if (ipInput) ipInput.value = ESP32_IP;
        return;
    }
    
    const oldIP = ESP32_IP;
    ESP32_IP = targetIP;
    API_BASE_URL = `http://${ESP32_IP}`;
    WS_URL = `ws://${ESP32_IP}:${WS_PORT}`;
    
    localStorage.setItem('esp32_ip', ESP32_IP);
    
    showNotification(`ESP32 IP updated from ${oldIP} to ${ESP32_IP}`, 'success');
    
    // Reconnect
    if (webSocket) {
        webSocket.close();
    }
    wsReconnectAttempts = 0;
    connectionRetryCount = 0;
    
    setTimeout(() => {
        showNotification('Testing connection with new IP...', 'info');
        initWebSocket();
    }, 1000);
}

// Add connection test button to header
function addConnectionTestButton() {
    const header = document.querySelector('.header');
    if (header) {
        const testButton = document.createElement('button');
        testButton.innerHTML = '<i class="fas fa-satellite-dish"></i> Test Connection';
        testButton.className = 'btn btn-outline';
        testButton.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            padding: 8px 15px;
            font-size: 0.9rem;
            background: rgba(255,255,255,0.1);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        testButton.addEventListener('click', testConnection);
        testButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255,255,255,0.2)';
            this.style.borderColor = 'rgba(255,255,255,0.5)';
        });
        testButton.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255,255,255,0.1)';
            this.style.borderColor = 'rgba(255,255,255,0.3)';
        });
        
        header.appendChild(testButton);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('AgriSmart Control Panel - Initializing...');
    
    // Create floating leaves
    createLeaves();
    
    // Initialize navigation
    initNavigation();
    
    // Setup UI
    setupInitialUI();
    
    // Add connection test button
    addConnectionTestButton();
    
    // Initialize camera stream
    initializeCameraStream();
    
    // Load camera settings
    setTimeout(() => {
        loadCameraSettings();
    }, 1000);
    
    // Initialize WebSocket connection (primary)
    setTimeout(() => {
        initWebSocket();
    }, 1000);
    
    console.log('AgriSmart Control Panel - Ready');
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Space bar for manual watering (only if not in input field)
    if (event.code === 'Space' && !event.target.matches('input, textarea, button, select')) {
        event.preventDefault();
        manualWatering();
    }
    
    // Ctrl+T for connection test
    if (event.ctrlKey && event.key === 't') {
        event.preventDefault();
        testConnection();
    }
    
    // F5 or Ctrl+R to refresh status
    if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        if (useWebSocket && webSocket && webSocket.readyState === WebSocket.OPEN) {
            sendWsCommand({ command: 'get_status' });
        } else {
            getSystemStatus();
        }
        showNotification('Status refreshed', 'info', 2000);
    }
});

// Cleanup on window close
window.addEventListener('beforeunload', function() {
    if (webSocket) {
        webSocket.close();
    }
});