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

// Navigation handler
document.addEventListener('DOMContentLoaded', function() {
    // Create floating leaves
    createLeaves();
    
    // Initialize navigation
    initNavigation();
    
    // Set active navigation based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Initialize charts
    initCharts();
});

// Chart initialization
function initCharts() {
    // Productivity Chart
    const productivityCtx = document.getElementById('productivityChart').getContext('2d');
    new Chart(productivityCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
            datasets: [{
                label: 'Produktivitas (%)',
                data: [78, 82, 85, 88, 92, 95],
                borderColor: '#2c7a2c',
                backgroundColor: 'rgba(44, 122, 44, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });

    // Resource Chart
    const resourceCtx = document.getElementById('resourceChart').getContext('2d');
    new Chart(resourceCtx, {
        type: 'bar',
        data: {
            labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
            datasets: [{
                label: 'Air (Liter)',
                data: [45, 52, 48, 55],
                backgroundColor: 'rgba(44, 122, 44, 0.8)',
                borderColor: '#2c7a2c',
                borderWidth: 1
            }, {
                label: 'Pupuk (kg)',
                data: [8, 9, 7, 10],
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                borderColor: 'rgb(245, 158, 11)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// Export functions
function exportReport(format) {
    const messages = {
        pdf: 'Mengeksport laporan dalam format PDF...',
        excel: 'Mengeksport laporan dalam format Excel...',
        csv: 'Mengeksport laporan dalam format CSV...'
    };

    alert(messages[format] || 'Mengeksport laporan...');
    
    // Simulate export process
    setTimeout(() => {
        alert(`Laporan berhasil dieksport dalam format ${format.toUpperCase()}!`);
    }, 1500);
}