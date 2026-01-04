// ============================================
// AgriSmart - Complete Profile Page Script
// ============================================

// Storage Keys
const USERS_STORAGE_KEY = 'agrismart_users';
const CURRENT_USER_KEY = 'agrismart_current_user';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Complete Profile Page - Initializing...');
    
    // Create floating leaves animation
    createLeaves();
    
    // Initialize bidang tags
    initBidangTags();
    
    // Load Google user data
    loadGoogleUserData();
    
    console.log('✅ Complete Profile Page - Ready');
});

// ============================================
// LOAD GOOGLE USER DATA
// ============================================

function loadGoogleUserData() {
    const user = getCurrentUser();
    
    if (!user) {
        // No user logged in, redirect to login
        console.log('❌ No user found, redirecting to login...');
        window.location.replace('login.html');
        return;
    }
    
    // Check if profile is already complete - redirect to dashboard
    if (user.profileComplete === true) {
        console.log('✅ Profile already complete, redirecting to dashboard...');
        window.location.replace('../index.html');
        return;
    }
    
    console.log('👤 Loading user data for profile completion:', user.email);
    
    // Populate Google banner info
    document.getElementById('google-name').textContent = user.fullname || 'Pengguna';
    document.getElementById('google-email').textContent = user.email || '';
    
    // Set Google avatar
    const avatarEl = document.getElementById('google-avatar');
    if (user.picture) {
        avatarEl.innerHTML = `<img src="${user.picture}" alt="Profile" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
    }
    
    // Pre-fill form fields with existing data
    document.getElementById('fullname').value = user.fullname || '';
    if (user.phone) document.getElementById('phone').value = user.phone;
    if (user.birthplace) document.getElementById('birthplace').value = user.birthplace;
    if (user.birthdate) document.getElementById('birthdate').value = user.birthdate;
    if (user.address) document.getElementById('address').value = user.address;
    
    // Pre-select existing bidang if any
    if (user.bidang && Array.isArray(user.bidang) && user.bidang.length > 0) {
        user.bidang.forEach(b => {
            const checkbox = document.querySelector(`input[name="bidang"][value="${b.toLowerCase()}"]`);
            if (checkbox) {
                checkbox.checked = true;
                checkbox.closest('.bidang-tag').classList.add('selected');
            }
        });
    }
}

// ============================================
// HANDLE FORM SUBMISSION
// ============================================

async function handleCompleteProfile(event) {
    event.preventDefault();
    
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const birthplace = document.getElementById('birthplace').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const address = document.getElementById('address').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const selectedBidang = getSelectedBidang();
    const completeBtn = document.getElementById('complete-btn');
    
    // Reset messages
    hideError();
    hideSuccess();
    
    // Validation
    if (!fullname) {
        showError('Mohon isi nama lengkap');
        document.getElementById('fullname').focus();
        return;
    }
    
    if (!phone) {
        showError('Mohon isi nomor HP');
        document.getElementById('phone').focus();
        return;
    }
    
    // Validate phone format (Indonesian format)
    if (!isValidPhone(phone)) {
        showError('Format nomor HP tidak valid. Gunakan format 08xxxxxxxxxx');
        document.getElementById('phone').focus();
        return;
    }
    
    if (!birthplace) {
        showError('Mohon isi tempat lahir');
        document.getElementById('birthplace').focus();
        return;
    }
    
    if (!birthdate) {
        showError('Mohon isi tanggal lahir');
        document.getElementById('birthdate').focus();
        return;
    }
    
    if (selectedBidang.length === 0) {
        showError('Mohon pilih minimal satu bidang pertanian');
        return;
    }
    
    // Password validation
    if (!password) {
        showError('Mohon isi kata sandi');
        document.getElementById('password').focus();
        return;
    }
    
    if (password.length < 8) {
        showError('Kata sandi minimal 8 karakter');
        document.getElementById('password').focus();
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Konfirmasi kata sandi tidak cocok');
        document.getElementById('confirm-password').focus();
        return;
    }
    
    // Show loading
    setButtonLoading(completeBtn, true);
    
    // Simulate API call
    await sleep(1000);
    
    // Update user data
    const currentUser = getCurrentUser();
    const updatedData = {
        fullname,
        phone,
        birthplace,
        birthdate,
        bidang: selectedBidang,
        address,
        password: hashPassword(password),
        profileComplete: true,
        updatedAt: new Date().toISOString()
    };
    
    // Update in users storage
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedData };
        saveUsers(users);
        
        // Update current session
        setCurrentUser(users[userIndex]);
        
        console.log('✅ Profile updated successfully');
    } else {
        console.error('❌ User not found in storage');
        showError('Terjadi kesalahan. Silakan coba lagi.');
        setButtonLoading(completeBtn, false);
        return;
    }
    
    showSuccess('Profil berhasil dilengkapi! Mengalihkan ke dashboard...');
    
    // Redirect to dashboard
    setTimeout(() => {
        window.location.replace('../index.html');
    }, 1500);
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

function isValidPhone(phone) {
    // Indonesian phone format: starts with 08, 10-13 digits total
    const phoneRegex = /^08[0-9]{8,11}$/;
    return phoneRegex.test(phone);
}

// ============================================
// PASSWORD FUNCTIONS
// ============================================

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(16);
}

function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('password-strength-bar');
    const hint = document.getElementById('password-hint');
    
    if (!strengthBar || !hint) return;
    
    // Reset
    strengthBar.className = 'password-strength-bar';
    
    if (password.length === 0) {
        strengthBar.style.width = '0%';
        hint.textContent = 'Gunakan minimal 8 karakter dengan huruf dan angka';
        return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength++;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength++;
    
    // Contains number
    if (/[0-9]/.test(password)) strength++;
    
    // Contains special char
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    // Update UI
    if (strength <= 2) {
        strengthBar.classList.add('weak');
        hint.textContent = 'Kata sandi lemah';
        hint.style.color = '#e74c3c';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        hint.textContent = 'Kata sandi sedang';
        hint.style.color = '#f39c12';
    } else {
        strengthBar.classList.add('strong');
        hint.textContent = 'Kata sandi kuat';
        hint.style.color = '#27ae60';
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const eyeIcon = document.getElementById(inputId + '-eye');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// ============================================
// BIDANG PERTANIAN TAGS
// ============================================

function initBidangTags() {
    const bidangContainer = document.getElementById('bidang-container');
    if (!bidangContainer) return;
    
    const tags = bidangContainer.querySelectorAll('.bidang-tag');
    
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
            
            // Show/hide custom input for "Lainnya"
            if (this.id === 'bidang-lainnya') {
                const customInput = document.getElementById('custom-bidang');
                customInput.classList.toggle('show', checkbox.checked);
                
                if (checkbox.checked) {
                    document.getElementById('custom-bidang-input').focus();
                }
            }
        });
    });
}

function getSelectedBidang() {
    const checkboxes = document.querySelectorAll('input[name="bidang"]:checked');
    let selected = Array.from(checkboxes).map(cb => cb.value);
    
    // If "lainnya" is selected, get custom value
    if (selected.includes('lainnya')) {
        const customValue = document.getElementById('custom-bidang-input')?.value.trim();
        if (customValue) {
            selected = selected.filter(s => s !== 'lainnya');
            selected.push(customValue);
        } else {
            // Remove 'lainnya' if no custom value provided
            selected = selected.filter(s => s !== 'lainnya');
        }
    }
    
    return selected;
}

// ============================================
// USER DATA FUNCTIONS
// ============================================

function getUsers() {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    const sessionUser = { ...user };
    delete sessionUser.password;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
}

// Logout and redirect to login
function logoutAndRedirect(event) {
    event.preventDefault();
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'login.html';
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.classList.add('show');
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.classList.remove('show');
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    
    if (successDiv && successText) {
        successText.textContent = message;
        successDiv.classList.add('show');
    }
}

function hideSuccess() {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.classList.remove('show');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast?.querySelector('i');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        
        if (toastIcon) {
            toastIcon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

function setButtonLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-check-circle"></i> Simpan & Lanjutkan';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================

window.handleCompleteProfile = handleCompleteProfile;
window.logoutAndRedirect = logoutAndRedirect;
window.togglePassword = togglePassword;
window.checkPasswordStrength = checkPasswordStrength;