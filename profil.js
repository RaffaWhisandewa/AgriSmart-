// ============================================
// AgriSmart Profile Page
// ============================================

const USERS_STORAGE_KEY = 'agrismart_users';
const CURRENT_USER_KEY = 'agrismart_current_user';

let currentUser = null;
let originalUserData = null;
let isEditMode = false;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('AgriSmart Profile - Initializing...');
    
    // Create floating leaves
    createLeaves();
    
    // Check authentication
    checkAuth();
    
    // Load user profile
    loadUserProfile();
    
    // Initialize bidang tags
    initBidangTags();
    
    console.log('AgriSmart Profile - Ready');
});

// ============================================
// FLOATING LEAVES ANIMATION
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
// AUTHENTICATION
// ============================================

function checkAuth() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    if (!user) {
        window.location.href = '../LOGIN/login.html';
        return;
    }
    currentUser = JSON.parse(user);
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    showToast('Berhasil keluar dari akun', 'success');
    setTimeout(() => {
        window.location.href = '../LOGIN/login.html';
    }, 1000);
}

// ============================================
// LOAD USER PROFILE
// ============================================

function loadUserProfile() {
    if (!currentUser) return;
    
    // Get full user data from storage
    const users = getUsers();
    const fullUserData = users.find(u => u.email === currentUser.email);
    
    if (fullUserData) {
        currentUser = fullUserData;
        originalUserData = { ...fullUserData };
    }
    
    // Update profile header
    document.getElementById('profile-name').textContent = currentUser.fullname || 'Pengguna';
    document.getElementById('profile-email').textContent = currentUser.email || '';
    
    // Update User ID display
    const userIdElement = document.getElementById('profile-user-id');
    if (userIdElement) {
        userIdElement.textContent = currentUser.userId || 'N/A';
    }
    
    // Update profile avatar if Google picture exists
    const avatarEl = document.getElementById('profile-avatar');
    if (currentUser.picture) {
        avatarEl.innerHTML = `<img src="${currentUser.picture}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
    }
    
    // Update bidang badge
    const bidang = currentUser.bidang || [];
    document.getElementById('profile-bidang').textContent = bidang.length > 0 ? bidang.join(', ') : 'Belum ditentukan';
    
    // Fill form fields
    document.getElementById('fullname').value = currentUser.fullname || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('phone').value = currentUser.phone || '';
    document.getElementById('birthplace').value = currentUser.birthplace || '';
    document.getElementById('birthdate').value = currentUser.birthdate || '';
    document.getElementById('address').value = currentUser.address || '';
    
    // Set created at
    const createdAt = currentUser.createdAt ? new Date(currentUser.createdAt) : new Date();
    document.getElementById('created-at').value = formatDate(createdAt);
    
    // Set bidang checkboxes
    setBidangCheckboxes(bidang);
    
    // Update stats
    updateStats();
}

function setBidangCheckboxes(bidangArray) {
    const standardBidang = ['cabai', 'tomat', 'terong', 'padi', 'jagung', 'sayuran', 'buah'];
    const customBidang = [];
    
    // Reset all checkboxes
    document.querySelectorAll('input[name="bidang"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.bidang-tag').classList.remove('selected');
    });
    
    bidangArray.forEach(b => {
        const lowerB = b.toLowerCase();
        if (standardBidang.includes(lowerB)) {
            const checkbox = document.querySelector(`input[name="bidang"][value="${lowerB}"]`);
            if (checkbox) {
                checkbox.checked = true;
                checkbox.closest('.bidang-tag').classList.add('selected');
            }
        } else if (lowerB !== 'lainnya' && lowerB !== 'umum') {
            customBidang.push(b);
        }
    });
    
    // Handle custom bidang
    if (customBidang.length > 0) {
        const lainnyaCheckbox = document.querySelector('input[name="bidang"][value="lainnya"]');
        if (lainnyaCheckbox) {
            lainnyaCheckbox.checked = true;
            lainnyaCheckbox.closest('.bidang-tag').classList.add('selected');
        }
        document.getElementById('custom-bidang').classList.add('show');
        document.getElementById('custom-bidang-input').value = customBidang.join(', ');
    }
}

function updateStats() {
    // Calculate days since joined
    const createdAt = currentUser.createdAt ? new Date(currentUser.createdAt) : new Date();
    const today = new Date();
    const diffTime = Math.abs(today - createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    document.getElementById('stat-days').textContent = diffDays;
    document.getElementById('stat-bidang').textContent = (currentUser.bidang || []).length;
}

// ============================================
// COPY USER ID FUNCTION
// ============================================

function copyUserId() {
    const userId = currentUser?.userId;
    if (!userId) {
        showToast('User ID tidak tersedia', 'error');
        return;
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(userId).then(() => {
        showToast('User ID berhasil disalin!', 'success');
    }).catch(err => {
        console.error('Gagal menyalin:', err);
        // Fallback untuk browser yang tidak support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = userId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('User ID berhasil disalin!', 'success');
    });
}

// ============================================
// EDIT MODE
// ============================================

function enableEdit() {
    isEditMode = true;
    
    // Enable form fields (except email and created-at)
    document.getElementById('fullname').disabled = false;
    document.getElementById('phone').disabled = false;
    document.getElementById('birthplace').disabled = false;
    document.getElementById('birthdate').disabled = false;
    document.getElementById('address').disabled = false;
    
    // Enable bidang checkboxes
    document.querySelectorAll('input[name="bidang"]').forEach(cb => {
        cb.disabled = false;
        cb.closest('.bidang-tag').classList.remove('disabled');
    });
    document.getElementById('custom-bidang-input').disabled = false;
    
    // Toggle buttons
    document.getElementById('btn-edit').style.display = 'none';
    document.getElementById('btn-save').style.display = 'inline-flex';
    document.getElementById('btn-cancel').style.display = 'inline-flex';
    
    // Add visual indicator
    document.querySelector('.profile-card').classList.add('editing');
    
    showToast('Mode edit aktif', 'success');
}

function cancelEdit() {
    isEditMode = false;
    
    // Restore original data
    loadUserProfile();
    
    // Disable form fields
    document.getElementById('fullname').disabled = true;
    document.getElementById('phone').disabled = true;
    document.getElementById('birthplace').disabled = true;
    document.getElementById('birthdate').disabled = true;
    document.getElementById('address').disabled = true;
    
    // Disable bidang checkboxes
    document.querySelectorAll('input[name="bidang"]').forEach(cb => {
        cb.disabled = true;
        cb.closest('.bidang-tag').classList.add('disabled');
    });
    document.getElementById('custom-bidang-input').disabled = true;
    
    // Toggle buttons
    document.getElementById('btn-edit').style.display = 'inline-flex';
    document.getElementById('btn-save').style.display = 'none';
    document.getElementById('btn-cancel').style.display = 'none';
    
    // Remove visual indicator
    document.querySelector('.profile-card').classList.remove('editing');
    
    showToast('Perubahan dibatalkan', 'error');
}

function saveProfile(event) {
    event.preventDefault();
    
    if (!isEditMode) return;
    
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const birthplace = document.getElementById('birthplace').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const address = document.getElementById('address').value.trim();
    const selectedBidang = getSelectedBidang();
    
    // Validation
    if (!fullname) {
        showAlert('error', 'Nama lengkap tidak boleh kosong');
        return;
    }
    
    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
        showAlert('error', 'Format nomor HP tidak valid. Gunakan format 08xxxxxxxxxx');
        return;
    }
    
    // Update user data
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex !== -1) {
        users[userIndex].fullname = fullname;
        users[userIndex].phone = phone;
        users[userIndex].birthplace = birthplace;
        users[userIndex].birthdate = birthdate;
        users[userIndex].address = address;
        users[userIndex].bidang = selectedBidang;
        users[userIndex].updatedAt = new Date().toISOString();
        
        // Save to storage
        saveUsers(users);
        
        // Update current user session
        currentUser = users[userIndex];
        const sessionUser = { ...currentUser };
        delete sessionUser.password;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
        
        // Update UI
        document.getElementById('profile-name').textContent = fullname;
        document.getElementById('profile-bidang').textContent = selectedBidang.join(', ');
        
        // Update stats
        updateStats();
        
        // Exit edit mode
        cancelEdit();
        
        showAlert('success', 'Profil berhasil diperbarui!');
        showToast('Profil berhasil disimpan', 'success');
    } else {
        showAlert('error', 'Gagal menyimpan profil. Silakan coba lagi.');
    }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

function isValidPhone(phone) {
    // Indonesian phone format: starts with 08, 10-13 digits total
    const phoneRegex = /^08[0-9]{8,11}$/;
    return phoneRegex.test(phone);
}

function getSelectedBidang() {
    const checkboxes = document.querySelectorAll('input[name="bidang"]:checked');
    let selected = Array.from(checkboxes).map(cb => cb.value);
    
    // If "lainnya" is selected, get custom value
    if (selected.includes('lainnya')) {
        const customValue = document.getElementById('custom-bidang-input')?.value.trim();
        if (customValue) {
            selected = selected.filter(s => s !== 'lainnya');
            // Split by comma if multiple custom values
            const customValues = customValue.split(',').map(v => v.trim()).filter(v => v);
            selected.push(...customValues);
        }
    }
    
    return selected;
}

// ============================================
// BIDANG TAGS
// ============================================

function initBidangTags() {
    const tags = document.querySelectorAll('.bidang-tag');
    
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            if (!isEditMode) return;
            
            const checkbox = this.querySelector('input[type="checkbox"]');
            if (checkbox.disabled) return;
            
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
            
            // Show/hide custom input for "Lainnya"
            if (this.id === 'bidang-lainnya') {
                const customInput = document.getElementById('custom-bidang');
                customInput.classList.toggle('show', checkbox.checked);
            }
        });
    });
}

// ============================================
// CHANGE PASSWORD
// ============================================

function changePassword() {
    document.getElementById('password-modal').classList.add('show');
}

function closeModal() {
    document.getElementById('password-modal').classList.remove('show');
    document.getElementById('password-form').reset();
}

function savePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    
    // Validation
    if (newPassword.length < 8) {
        showToast('Kata sandi baru minimal 8 karakter', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('Konfirmasi kata sandi tidak cocok', 'error');
        return;
    }
    
    // Check current password
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex !== -1) {
        if (users[userIndex].password !== hashPassword(currentPassword)) {
            showToast('Kata sandi saat ini salah', 'error');
            return;
        }
        
        // Update password
        users[userIndex].password = hashPassword(newPassword);
        saveUsers(users);
        
        closeModal();
        showToast('Kata sandi berhasil diubah', 'success');
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Simple hash function (same as auth.js)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(16);
}

// ============================================
// STORAGE FUNCTIONS
// ============================================

function getUsers() {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// ============================================
// UI HELPERS
// ============================================

function showAlert(type, message) {
    hideAlerts();
    
    const alertId = type === 'success' ? 'success-alert' : 'error-alert';
    const alert = document.getElementById(alertId);
    
    if (type === 'error') {
        document.getElementById('error-text').textContent = message;
    }
    
    alert.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

function hideAlerts() {
    document.getElementById('success-alert').classList.remove('show');
    document.getElementById('error-alert').classList.remove('show');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('i');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toastIcon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
}

// ============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================

window.enableEdit = enableEdit;
window.cancelEdit = cancelEdit;
window.saveProfile = saveProfile;
window.logout = logout;
window.changePassword = changePassword;
window.closeModal = closeModal;
window.savePassword = savePassword;
window.togglePasswordVisibility = togglePasswordVisibility;
window.copyUserId = copyUserId;