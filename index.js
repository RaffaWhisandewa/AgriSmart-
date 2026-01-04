// ============================================
// AUTH CHECK & USER MENU
// ============================================

const CURRENT_USER_KEY = 'agrismart_current_user';

function checkAuth() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    if (!user) {
        // Not logged in, redirect to login
        window.location.href = 'LOGIN/login.html';
        return null;
    }
    return JSON.parse(user);
}

function loadUserInfo() {
    const user = checkAuth();
    if (!user) return;
    
    // Update user menu
    const userName = document.getElementById('user-name');
    const dropdownFullname = document.getElementById('dropdown-fullname');
    const dropdownEmail = document.getElementById('dropdown-email');
    
    if (userName) userName.textContent = user.fullname?.split(' ')[0] || 'Pengguna';
    if (dropdownFullname) dropdownFullname.textContent = user.fullname || 'Pengguna';
    if (dropdownEmail) dropdownEmail.textContent = user.email || '';
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'LOGIN/login.html';
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('user-menu');
    const dropdown = document.getElementById('user-dropdown');
    
    if (userMenu && dropdown && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Fungsi untuk membuat daun-daun animasi (sama seperti pengaturan)
function createLeaves() {
    const leavesContainer = document.getElementById('leaves-container');
    const leafTypes = ['🍀', '🌿', '🍃', '🌱', '☘️'];
    const leafColors = ['#2c7a2c', '#3a9e3a', '#4db84d', '#5cb85c', '#6ac36a'];
    
    for (let i = 0; i < 15; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        
        // Pilih random emoji daun atau gunakan SVG
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
        
        // Atur posisi dan animasi
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.animationDuration = `${Math.random() * 20 + 10}s`;
        leaf.style.animationDelay = `${Math.random() * 5}s`;
        
        leavesContainer.appendChild(leaf);
    }
}

// Update data sensor secara real-time
function updateSensorData() {
    // Simulasi perubahan data acak
    const tempChange = (Math.random() - 0.5) * 0.5;
    const humidityChange = (Math.random() - 0.5) * 2;
    const phChange = (Math.random() - 0.5) * 0.1;
    const lightChange = (Math.random() - 0.5) * 20;
    
    // Update nilai di card dengan animasi
    animateValue('temperature', 28.1, 28.1 + tempChange, 1000, '°C');
    animateValue('humidity', 69, 69 + humidityChange, 1000, '%');
    animateValue('ph', 7.4, 7.4 + phChange, 1000, '');
    animateValue('light', 803, 803 + lightChange, 1000, ' lx');
    
    // Update chart data
    updateChartData();
}

// Fungsi untuk animasi perubahan nilai
function animateValue(id, start, end, duration, unit) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = progress * (end - start) + start;
        obj.innerHTML = (unit === '°C' || unit === '') ? 
            value.toFixed(1) + unit : 
            Math.round(value) + unit;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Update chart data
function updateChartData() {
    if (!window.sensorChart) return;
    
    const chart = window.sensorChart;
    const now = new Date();
    const timeLabel = now.getHours().toString().padStart(2, '0') + ':' + 
                    now.getMinutes().toString().padStart(2, '0');
    
    // Geser data lama
    chart.data.labels.shift();
    chart.data.labels.push(timeLabel);
    
    // Update dataset
    chart.data.datasets.forEach(dataset => {
        const lastValue = parseFloat(dataset.data[dataset.data.length - 1]);
        let newValue;
        
        if (dataset.label.includes('Suhu')) {
            newValue = lastValue + (Math.random() - 0.5) * 0.5;
            newValue = Math.max(27, Math.min(30, newValue));
        } else if (dataset.label.includes('Kelembaban')) {
            newValue = lastValue + (Math.random() - 0.5) * 2;
            newValue = Math.max(65, Math.min(75, newValue));
        } else {
            newValue = lastValue + (Math.random() - 0.5) * 0.1;
            newValue = Math.max(7.2, Math.min(7.6, newValue));
        }
        
        dataset.data.shift();
        dataset.data.push(newValue);
    });
    
    chart.update();
}

// Initialize navigation items with proper click handling
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
        });
    });
}

// Inisialisasi chart
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    loadUserInfo();
    
    // Create floating leaves
    createLeaves();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize chart
    const ctx = document.getElementById('sensorChart').getContext('2d');
    window.sensorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 12}, (_, i) => {
                const d = new Date();
                d.setHours(d.getHours() - 1 + i);
                return d.getHours().toString().padStart(2, '0') + ':00';
            }),
            datasets: [{
                label: 'Suhu (°C)',
                data: Array.from({length: 12}, () => 28 + Math.random() * 2),
                borderColor: '#2c7a2c',
                backgroundColor: 'rgba(44, 122, 44, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 2
            }, {
                label: 'Kelembaban (%)',
                data: Array.from({length: 12}, () => 65 + Math.random() * 8),
                borderColor: '#5cb85c',
                backgroundColor: 'rgba(92, 184, 92, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 2
            }, {
                label: 'pH Tanah',
                data: Array.from({length: 12}, () => 7.3 + Math.random() * 0.4),
                borderColor: '#8bc34a',
                backgroundColor: 'rgba(139, 195, 74, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        }
    });
    
    // Update data setiap 3 detik
    setInterval(updateSensorData, 3000);
});