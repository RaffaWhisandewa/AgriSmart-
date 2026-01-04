// ============================================
// AgriSmart Monitoring - WebSocket Integration
// ============================================

// ESP32 Configuration - akan di-override dari device list
let ESP32_IP = '192.168.1.11';
let WS_PORT = 81;
let WS_URL = `ws://${ESP32_IP}:${WS_PORT}`;

// WebSocket instance
let webSocket = null;
let wsReconnectAttempts = 0;
let maxReconnectAttempts = 5;

// Chart variables
let monitoringChart;
let isChartPaused = false;
let lastUpdateTime = Date.now();

// System data from ESP32
let sensorData = {
    temperature: 0,
    humidity_air: 0,
    soil_moisture_1: 0,
    soil_moisture_2: 0,
    ph_area_a: 6.5,  // pH Area A (default)
    ph_area_b: 6.5,  // pH Area B (default)
    sensor_online: false,
    rssi: 0,
    interval: 5,
    uptime: 0,
    ip_address: '',
    current_time: ''
};

// Track last pH alert to avoid spam
let lastPhAlert = {
    area_a: null,
    area_b: null
};

// Threshold settings
let thresholds = {
    humidity_dry: 50,
    humidity_wet: 70,
    ph_acidic: 5.5,
    ph_alkaline: 7.5
};

// Actuator status
let actuators = {
    pump1: false,
    pump2: false,
    auto_mode: false,
    schedule_mode: false
};

// Chart data storage
const chartData = {
    temperature: {
        labels: [],
        datasets: [{
            label: 'Suhu Udara',
            data: [],
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    humidity: {
        labels: [],
        datasets: [{
            label: 'Kelembaban Tanah 1',
            data: [],
            borderColor: '#2c7a2c',
            backgroundColor: 'rgba(44, 122, 44, 0.1)',
            tension: 0.4,
            fill: true
        }, {
            label: 'Kelembaban Tanah 2',
            data: [],
            borderColor: '#5cb85c',
            backgroundColor: 'rgba(92, 184, 92, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    ph: {
        labels: [],
        datasets: [{
            label: 'pH Tanah',
            data: [],
            borderColor: '#fdcb6e',
            backgroundColor: 'rgba(253, 203, 110, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    light: {
        labels: [],
        datasets: [{
            label: 'Intensitas Cahaya',
            data: [],
            borderColor: '#74b9ff',
            backgroundColor: 'rgba(116, 185, 255, 0.1)',
            tension: 0.4,
            fill: true
        }]
    }
};

// Initialize chart data with empty arrays
function initChartData() {
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5000);
        const timeLabel = time.getHours().toString().padStart(2, '0') + ':' + 
                         time.getMinutes().toString().padStart(2, '0') + ':' +
                         time.getSeconds().toString().padStart(2, '0');
        
        Object.keys(chartData).forEach(sensor => {
            chartData[sensor].labels.push(timeLabel);
            chartData[sensor].datasets.forEach(dataset => {
                dataset.data.push(null);
            });
        });
    }
}

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
        // Return IP of first sprinkler that has IP configured
        for (const sprinkler of devices.sprinklers) {
            if (sprinkler.ip) {
                return sprinkler.ip;
            }
        }
    }
    return null;
}

// ============================================
// WEBSOCKET FUNCTIONS
// ============================================

function initWebSocket() {
    // Priority: 1. Device from user's device list, 2. Saved IP, 3. Default
    const deviceIP = getFirstSprinklerIP();
    if (deviceIP) {
        ESP32_IP = deviceIP;
        console.log(`📱 Using IP from registered device: ${ESP32_IP}`);
    } else {
        const savedIP = localStorage.getItem('esp32_ip');
        if (savedIP) {
            ESP32_IP = savedIP;
            console.log(`💾 Using saved IP: ${ESP32_IP}`);
        }
    }
    WS_URL = `ws://${ESP32_IP}:${WS_PORT}`;
    
    console.log(`🔌 Connecting to WebSocket: ${WS_URL}`);
    updateConnectionStatus('connecting');
    
    try {
        webSocket = new WebSocket(WS_URL);
        
        webSocket.onopen = function(event) {
            console.log('✅ WebSocket Connected!');
            wsReconnectAttempts = 0;
            updateConnectionStatus('connected');
            
            // Request initial status
            webSocket.send(JSON.stringify({ command: 'get_status' }));
        };
        
        webSocket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                console.log('📥 Data received:', data);
                handleWebSocketData(data);
            } catch (e) {
                console.error('Error parsing WebSocket data:', e);
            }
        };
        
        webSocket.onclose = function(event) {
            console.log('❌ WebSocket Disconnected');
            updateConnectionStatus('disconnected');
            
            // Auto reconnect
            if (wsReconnectAttempts < maxReconnectAttempts) {
                wsReconnectAttempts++;
                const delay = Math.min(5000 * wsReconnectAttempts, 30000);
                console.log(`🔄 Reconnecting in ${delay/1000}s...`);
                
                setTimeout(() => {
                    initWebSocket();
                }, delay);
            }
        };
        
        webSocket.onerror = function(error) {
            console.error('WebSocket Error:', error);
        };
        
    } catch (e) {
        console.error('Failed to create WebSocket:', e);
        updateConnectionStatus('error');
    }
}

function handleWebSocketData(data) {
    // Update sensor data
    if (data.sensors) {
        sensorData.temperature = data.sensors.temperature || 0;
        sensorData.humidity_air = data.sensors.humidity_air || 0;
        sensorData.soil_moisture_1 = data.sensors.soil_moisture_1 || 0;
        sensorData.soil_moisture_2 = data.sensors.soil_moisture_2 || 0;
    }
    
    // Update other data
    sensorData.sensor_online = data.sensor_online;
    sensorData.rssi = data.rssi || 0;
    sensorData.interval = data.interval || 5;
    sensorData.uptime = data.uptime || 0;
    sensorData.ip_address = data.ip_address || '';
    sensorData.current_time = data.current_time || '';
    
    // Update thresholds
    if (data.thresholds) {
        thresholds = { ...thresholds, ...data.thresholds };
    }
    
    // Update actuators
    if (data.actuators) {
        actuators = { ...actuators, ...data.actuators };
    }
    
    // Update UI
    updateMonitoringUI();
    updateChartWithNewData();
    
    // Update last sync time
    lastUpdateTime = Date.now();
    updateLastSyncTime();
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

function updateConnectionStatus(status) {
    const gatewayCard = document.getElementById('gateway-card');
    const gatewayStatus = document.getElementById('gateway-status');
    const signalStrength = document.getElementById('signal-strength');
    
    switch(status) {
        case 'connected':
            if (gatewayCard) gatewayCard.className = 'device-card device-online';
            if (gatewayStatus) {
                gatewayStatus.textContent = 'Online';
                gatewayStatus.style.color = '#2c7a2c';
            }
            break;
        case 'connecting':
            if (gatewayCard) gatewayCard.className = 'device-card device-warning';
            if (gatewayStatus) {
                gatewayStatus.textContent = 'Connecting...';
                gatewayStatus.style.color = '#f59e0b';
            }
            break;
        case 'disconnected':
        case 'error':
            if (gatewayCard) gatewayCard.className = 'device-card device-offline';
            if (gatewayStatus) {
                gatewayStatus.textContent = 'Offline';
                gatewayStatus.style.color = '#dc3545';
            }
            break;
    }
    
    // Update signal strength
    if (signalStrength && sensorData.rssi) {
        const signalPercent = Math.min(100, Math.max(0, (sensorData.rssi + 100) * 2));
        signalStrength.textContent = signalPercent + '%';
    }
}

// ============================================
// pH ALERT FUNCTIONS
// ============================================

// Get pH status based on threshold
function getPhStatus(phValue) {
    if (phValue < thresholds.ph_acidic) {
        return {
            text: 'Terlalu Asam',
            class: 'status-danger',
            color: '#dc3545',
            icon: '🔴',
            type: 'acidic'
        };
    } else if (phValue > thresholds.ph_alkaline) {
        return {
            text: 'Terlalu Basa',
            class: 'status-info',
            color: '#3b82f6',
            icon: '🔵',
            type: 'alkaline'
        };
    } else {
        return {
            text: 'Optimal',
            class: 'status-optimal',
            color: '#2c7a2c',
            icon: '🟢',
            type: 'optimal'
        };
    }
}

// Check and show pH alerts
function checkPhAlerts() {
    const phA = sensorData.ph_area_a;
    const phB = sensorData.ph_area_b;
    
    const statusA = getPhStatus(phA);
    const statusB = getPhStatus(phB);
    
    // Check Area A
    if (statusA.type !== 'optimal' && lastPhAlert.area_a !== statusA.type) {
        lastPhAlert.area_a = statusA.type;
        showPhAlertNotification('Area A', phA, statusA);
    } else if (statusA.type === 'optimal') {
        lastPhAlert.area_a = null;
    }
    
    // Check Area B
    if (statusB.type !== 'optimal' && lastPhAlert.area_b !== statusB.type) {
        lastPhAlert.area_b = statusB.type;
        showPhAlertNotification('Area B', phB, statusB);
    } else if (statusB.type === 'optimal') {
        lastPhAlert.area_b = null;
    }
}

// Show pH alert notification
function showPhAlertNotification(area, phValue, status) {
    let recommendation = '';
    if (status.type === 'acidic') {
        recommendation = '💡 Rekomendasi: Tambahkan kapur/dolomit';
    } else if (status.type === 'alkaline') {
        recommendation = '💡 Rekomendasi: Tambahkan sulfur/kompos';
    }
    
    const message = `${status.icon} pH ${area} ${status.text}!\nNilai: ${phValue.toFixed(1)} (Batas: ${status.type === 'acidic' ? thresholds.ph_acidic : thresholds.ph_alkaline})\n${recommendation}`;
    
    showNotification(message, status.type === 'acidic' ? 'error' : 'warning', 8000);
}

// Update pH display in monitoring card
function updatePhDisplay() {
    const phA = sensorData.ph_area_a;
    const phB = sensorData.ph_area_b;
    
    const statusA = getPhStatus(phA);
    const statusB = getPhStatus(phB);
    
    // Update Area A
    const phAValue = document.getElementById('ph-a');
    const phAStatus = document.getElementById('ph-a-status');
    const phAProgress = document.getElementById('ph-a-progress');
    
    if (phAValue) phAValue.textContent = phA.toFixed(1);
    if (phAStatus) {
        phAStatus.textContent = statusA.text;
        phAStatus.style.color = statusA.color;
        phAStatus.className = `status-indicator ${statusA.class}`;
    }
    if (phAProgress) {
        phAProgress.style.width = (phA / 14 * 100) + '%';
        phAProgress.style.background = statusA.color;
    }
    
    // Update Area B
    const phBValue = document.getElementById('ph-b');
    const phBStatus = document.getElementById('ph-b-status');
    const phBProgress = document.getElementById('ph-b-progress');
    
    if (phBValue) phBValue.textContent = phB.toFixed(1);
    if (phBStatus) {
        phBStatus.textContent = statusB.text;
        phBStatus.style.color = statusB.color;
        phBStatus.className = `status-indicator ${statusB.class}`;
    }
    if (phBProgress) {
        phBProgress.style.width = (phB / 14 * 100) + '%';
        phBProgress.style.background = statusB.color;
    }
    
    // Check and show alerts
    checkPhAlerts();
}

function updateMonitoringUI() {
    // Update temperature
    const tempA = document.getElementById('tempA');
    if (tempA) tempA.textContent = sensorData.temperature.toFixed(1) + '°C';
    
    // Update DHT sensor card
    const dhtTemp = document.getElementById('dht-temp');
    const dhtHumidity = document.getElementById('dht-humidity');
    if (dhtTemp) dhtTemp.textContent = sensorData.temperature.toFixed(1) + '°C';
    if (dhtHumidity) dhtHumidity.textContent = sensorData.humidity_air.toFixed(1) + '%';
    
    // Update air humidity (tempB shows air humidity in new layout)
    const tempB = document.getElementById('tempB');
    if (tempB) tempB.textContent = sensorData.humidity_air.toFixed(1) + '%';
    
    // Update soil moisture
    const soil1Value = document.getElementById('soil1-value');
    const soil2Value = document.getElementById('soil2-value');
    
    if (soil1Value) soil1Value.textContent = sensorData.soil_moisture_1 + '%';
    if (soil2Value) soil2Value.textContent = sensorData.soil_moisture_2 + '%';
    
    // Update progress bars
    const tempProgress = document.getElementById('temp-progress');
    const soil1Progress = document.getElementById('soil1-progress');
    const soil2Progress = document.getElementById('soil2-progress');
    const airHumidityProgress = document.getElementById('air-humidity-progress');
    
    if (tempProgress) tempProgress.style.width = Math.min(100, (sensorData.temperature / 50) * 100) + '%';
    if (soil1Progress) soil1Progress.style.width = sensorData.soil_moisture_1 + '%';
    if (soil2Progress) soil2Progress.style.width = sensorData.soil_moisture_2 + '%';
    if (airHumidityProgress) airHumidityProgress.style.width = sensorData.humidity_air + '%';
    
    // Update soil moisture status indicators
    const soil1Status = document.getElementById('soil1-status');
    const soil2Status = document.getElementById('soil2-status');
    
    if (soil1Status) {
        if (sensorData.soil_moisture_1 < thresholds.humidity_dry) {
            soil1Status.textContent = 'Kering';
            soil1Status.className = 'status-indicator status-warning';
        } else if (sensorData.soil_moisture_1 > thresholds.humidity_wet) {
            soil1Status.textContent = 'Basah';
            soil1Status.className = 'status-indicator status-optimal';
        } else {
            soil1Status.textContent = 'Optimal';
            soil1Status.className = 'status-indicator status-optimal';
        }
    }
    
    if (soil2Status) {
        if (sensorData.soil_moisture_2 < thresholds.humidity_dry) {
            soil2Status.textContent = 'Kering';
            soil2Status.className = 'status-indicator status-warning';
        } else if (sensorData.soil_moisture_2 > thresholds.humidity_wet) {
            soil2Status.textContent = 'Basah';
            soil2Status.className = 'status-indicator status-optimal';
        } else {
            soil2Status.textContent = 'Optimal';
            soil2Status.className = 'status-indicator status-optimal';
        }
    }
    
    // Update pump status in device card
    const pump1Display = document.getElementById('pump1-display');
    const pump2Display = document.getElementById('pump2-display');
    const wateringMode = document.getElementById('watering-mode');
    
    if (pump1Display) {
        pump1Display.textContent = actuators.pump1 ? 'ON' : 'OFF';
        pump1Display.style.color = actuators.pump1 ? '#2c7a2c' : '#dc3545';
        pump1Display.style.fontWeight = '600';
    }
    if (pump2Display) {
        pump2Display.textContent = actuators.pump2 ? 'ON' : 'OFF';
        pump2Display.style.color = actuators.pump2 ? '#2c7a2c' : '#dc3545';
        pump2Display.style.fontWeight = '600';
    }
    if (wateringMode) {
        if (actuators.auto_mode) {
            wateringMode.textContent = 'Otomatis';
            wateringMode.style.color = '#2c7a2c';
        } else if (actuators.schedule_mode) {
            wateringMode.textContent = 'Terjadwal';
            wateringMode.style.color = '#f59e0b';
        } else {
            wateringMode.textContent = 'Manual';
            wateringMode.style.color = '#6c757d';
        }
    }
    
    // Update ESP32 info bar
    const esp32IpDisplay = document.getElementById('esp32-ip-display');
    const intervalDisplay = document.getElementById('sensor-interval-display');
    const rssiDisplay = document.getElementById('rssi-display');
    const uptimeDisplay = document.getElementById('uptime-display');
    const connectionTypeDisplay = document.getElementById('connection-type-display');
    
    if (esp32IpDisplay) esp32IpDisplay.textContent = sensorData.ip_address || ESP32_IP;
    if (intervalDisplay) intervalDisplay.textContent = sensorData.interval + ' detik';
    if (rssiDisplay) rssiDisplay.textContent = sensorData.rssi + ' dBm';
    if (uptimeDisplay) {
        const hours = Math.floor(sensorData.uptime / 3600);
        const mins = Math.floor((sensorData.uptime % 3600) / 60);
        const secs = sensorData.uptime % 60;
        if (hours > 0) {
            uptimeDisplay.textContent = `${hours}j ${mins}m`;
        } else if (mins > 0) {
            uptimeDisplay.textContent = `${mins}m ${secs}s`;
        } else {
            uptimeDisplay.textContent = `${secs}s`;
        }
    }
    if (connectionTypeDisplay) {
        connectionTypeDisplay.textContent = webSocket && webSocket.readyState === WebSocket.OPEN ? 'WebSocket' : 'HTTP';
    }
    
    // Update sensor status
    const sensorStatus = document.getElementById('sensor-status');
    if (sensorStatus) {
        if (sensorData.sensor_online) {
            sensorStatus.textContent = 'Online';
            sensorStatus.style.color = '#2c7a2c';
        } else {
            sensorStatus.textContent = 'Offline';
            sensorStatus.style.color = '#dc3545';
        }
    }
    
    // Update device status cards
    updateDeviceCards();
    
    // Update pH display and check alerts
    updatePhDisplay();
    
    // Update last update time
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
        lastUpdateEl.textContent = '0 detik lalu';
    }
}

function updateSensorCard(type, readings) {
    // This function can be expanded to update specific sensor cards
    console.log(`Updating ${type} sensor card:`, readings);
}

function updateDeviceCards() {
    // Update Gateway IoT card
    const gatewayCard = document.querySelector('.device-card:first-child');
    if (gatewayCard) {
        const signalEl = gatewayCard.querySelector('p:last-of-type');
        if (signalEl && sensorData.rssi) {
            const signalPercent = Math.min(100, Math.max(0, (sensorData.rssi + 100) * 2));
            signalEl.innerHTML = `<span>Signal</span>: ${signalPercent}%`;
        }
    }
    
    // Update sensor status indicator
    const sensorCards = document.querySelectorAll('.device-card');
    sensorCards.forEach(card => {
        const titleEl = card.querySelector('h4');
        if (titleEl && titleEl.textContent.includes('Sensor')) {
            if (sensorData.sensor_online) {
                card.className = 'device-card device-online';
            } else {
                card.className = 'device-card device-offline';
            }
        }
    });
}

function updateLastSyncTime() {
    const lastSyncEl = document.getElementById('lastSync');
    const lastUpdateEl = document.getElementById('lastUpdate');
    
    const updateDisplay = () => {
        const now = Date.now();
        const secondsAgo = Math.floor((now - lastUpdateTime) / 1000);
        
        if (lastSyncEl) lastSyncEl.textContent = secondsAgo + 's';
        if (lastUpdateEl) lastUpdateEl.textContent = secondsAgo + ' detik lalu';
    };
    
    updateDisplay();
    
    // Update every second
    setInterval(updateDisplay, 1000);
}

// ============================================
// CHART FUNCTIONS
// ============================================

function initChart() {
    const ctx = document.getElementById('monitoringChart');
    if (!ctx) return;
    
    initChartData();
    
    monitoringChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: chartData.temperature,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '°C'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            animation: {
                duration: 500
            }
        }
    });
    
    updateChartStats('temperature');
}

function updateChart(sensorType) {
    if (!monitoringChart) return;
    
    const data = chartData[sensorType];
    monitoringChart.data = data;
    
    let yLabel = '';
    switch(sensorType) {
        case 'temperature':
            yLabel = '°C';
            break;
        case 'humidity':
            yLabel = '%';
            break;
        case 'ph':
            yLabel = 'pH';
            break;
        case 'light':
            yLabel = 'lx';
            break;
    }
    
    monitoringChart.options.scales.y.title.text = yLabel;
    monitoringChart.update();
    updateChartStats(sensorType);
}

function updateChartWithNewData() {
    if (isChartPaused || !monitoringChart) return;
    
    const now = new Date();
    const timeLabel = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0') + ':' +
                     now.getSeconds().toString().padStart(2, '0');
    
    // Add new data to temperature chart
    chartData.temperature.labels.push(timeLabel);
    chartData.temperature.labels.shift();
    chartData.temperature.datasets[0].data.push(sensorData.temperature);
    chartData.temperature.datasets[0].data.shift();
    
    // Add new data to humidity chart
    chartData.humidity.labels.push(timeLabel);
    chartData.humidity.labels.shift();
    chartData.humidity.datasets[0].data.push(sensorData.soil_moisture_1);
    chartData.humidity.datasets[0].data.shift();
    chartData.humidity.datasets[1].data.push(sensorData.soil_moisture_2);
    chartData.humidity.datasets[1].data.shift();
    
    // Update current chart if it's being displayed
    const currentSensor = document.getElementById('sensorSelect')?.value || 'temperature';
    if (monitoringChart.data === chartData[currentSensor]) {
        monitoringChart.update('none');
        updateChartStats(currentSensor);
    }
}

function updateChartStats(sensorType) {
    const data = chartData[sensorType];
    let unit = '';
    
    switch(sensorType) {
        case 'temperature':
            unit = '°C';
            break;
        case 'humidity':
            unit = '%';
            break;
        case 'ph':
            unit = '';
            break;
        case 'light':
            unit = 'lx';
            break;
    }
    
    // Calculate statistics
    const allValues = [];
    data.datasets.forEach(dataset => {
        dataset.data.forEach(val => {
            if (val !== null && !isNaN(val)) {
                allValues.push(val);
            }
        });
    });
    
    if (allValues.length === 0) return;
    
    const sum = allValues.reduce((a, b) => a + b, 0);
    const avg = sum / allValues.length;
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);
    
    const avgEl = document.getElementById('avgValue');
    const maxEl = document.getElementById('maxValue');
    const minEl = document.getElementById('minValue');
    
    if (avgEl) avgEl.textContent = avg.toFixed(1) + unit;
    if (maxEl) maxEl.textContent = max.toFixed(1) + unit;
    if (minEl) minEl.textContent = min.toFixed(1) + unit;
}

// ============================================
// UI HELPER FUNCTIONS
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

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('AgriSmart Monitoring - Initializing...');
    
    // Create floating leaves
    createLeaves();
    
    // Initialize chart
    initChart();
    
    // Initialize WebSocket
    setTimeout(() => {
        initWebSocket();
    }, 500);
    
    // Sensor select change
    const sensorSelect = document.getElementById('sensorSelect');
    if (sensorSelect) {
        sensorSelect.addEventListener('change', function() {
            updateChart(this.value);
        });
    }
    
    // Time range select change
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
        timeRange.addEventListener('change', function() {
            console.log('Time range changed to:', this.value);
        });
    }
    
    // Pause button
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            isChartPaused = !isChartPaused;
            if (isChartPaused) {
                this.innerHTML = '<i class="fas fa-play"></i> Play';
                this.classList.add('active');
            } else {
                this.innerHTML = '<i class="fas fa-pause"></i> Pause';
                this.classList.remove('active');
            }
        });
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportChartData();
        });
    }
    
    console.log('AgriSmart Monitoring - Ready');
});

// Export chart data
function exportChartData() {
    const currentSensor = document.getElementById('sensorSelect')?.value || 'temperature';
    const data = chartData[currentSensor];
    
    const exportData = {
        sensor: currentSensor,
        timestamp: new Date().toISOString(),
        labels: data.labels,
        datasets: data.datasets.map(ds => ({
            label: ds.label,
            data: ds.data
        }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `agrismart-${currentSensor}-${new Date().toISOString().slice(0,10)}.json`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    alert('Data berhasil diekspor!');
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (webSocket) {
        webSocket.close();
    }
});