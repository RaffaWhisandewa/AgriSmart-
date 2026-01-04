// ============================================
// AgriSmart Authentication System
// ============================================

// Simulated User Database (localStorage)
const USERS_STORAGE_KEY = 'agrismart_users';
const CURRENT_USER_KEY = 'agrismart_current_user';

// Google OAuth Configuration
// PENTING: Ganti dengan Client ID Anda dari Google Cloud Console
const GOOGLE_CLIENT_ID = '730402256792-gk7t2m0uuueq8p7hgqse2fomonpli0q2.apps.googleusercontent.com';

// Flag to track Google library status
let googleLibraryLoaded = false;

// ============================================
// USER ID GENERATOR (Nanoid 10 karakter)
// ============================================

function generateUserId(length = 10) {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return id;
}

// Fungsi untuk memastikan User ID unik
function generateUniqueUserId() {
    const users = getUsers();
    let userId;
    let isUnique = false;
    
    while (!isUnique) {
        userId = generateUserId(10);
        // Cek apakah ID sudah ada
        isUnique = !users.some(user => user.userId === userId);
    }
    
    return userId;
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 AgriSmart Auth System - Initializing...');
    
    // Create floating leaves animation
    createLeaves();
    
    // Initialize bidang tags if on register page
    initBidangTags();
    
    // Check if user is already logged in
    checkAuthStatus();
    
    // Load Google OAuth Script
    loadGoogleOAuth();
    
    // Check for OAuth callback in URL (untuk redirect method)
    handleOAuthCallback();
    
    console.log('✅ AgriSmart Auth System - Ready');
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
        
        // Random emoji or SVG leaf
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
        
        // Set position and animation
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.animationDuration = `${Math.random() * 20 + 10}s`;
        leaf.style.animationDelay = `${Math.random() * 5}s`;
        
        leavesContainer.appendChild(leaf);
    }
}

// ============================================
// USER DATABASE FUNCTIONS
// ============================================

function getUsers() {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function findUserByEmail(email) {
    const users = getUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

function addUser(userData) {
    const users = getUsers();
    
    // Generate unique User ID jika belum ada
    const userId = userData.userId || generateUniqueUserId();
    
    users.push({
        ...userData,
        userId: userId,  // User ID unik (Nanoid 10 karakter)
        id: Date.now(),
        createdAt: new Date().toISOString()
    });
    saveUsers(users);
    
    console.log('✅ User created with ID:', userId);
    return userId;
}

function updateUser(email, newData) {
    const users = getUsers();
    const index = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
        users[index] = { ...users[index], ...newData };
        saveUsers(users);
        return users[index];
    }
    return null;
}

function setCurrentUser(user) {
    // Don't store password in session
    const sessionUser = { ...user };
    delete sessionUser.password;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
}

function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'LOGIN/login.html';
}

// ============================================
// AUTH STATUS CHECK
// ============================================

function checkAuthStatus() {
    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    // If logged in and on login/register page
    if (currentUser && (currentPage === 'login.html' || currentPage === 'register.html')) {
        // Check if profile is complete
        if (currentUser.profileComplete === true) {
            // Profile complete, go to dashboard
            window.location.href = '../index.html';
        } else {
            // Profile not complete, go to complete-profile page
            window.location.href = 'completeProfile.html';
        }
    }
}

// ============================================
// LOGIN FUNCTIONS
// ============================================

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    
    // Reset messages
    hideError();
    hideSuccess();
    
    // Validation
    if (!email || !password) {
        showError('Mohon isi semua field yang diperlukan');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Format email tidak valid');
        return;
    }
    
    // Show loading
    setButtonLoading(loginBtn, true);
    
    // Simulate API call delay
    await sleep(1000);
    
    // Find user
    const user = findUserByEmail(email);
    
    if (!user) {
        setButtonLoading(loginBtn, false);
        showError('Email tidak terdaftar. Silakan daftar terlebih dahulu.');
        return;
    }
    
    if (user.password !== hashPassword(password)) {
        setButtonLoading(loginBtn, false);
        showError('Kata sandi salah. Silakan coba lagi.');
        return;
    }
    
    // Login successful
    setCurrentUser(user);
    showSuccess('Login berhasil! Mengalihkan...');
    
    // Redirect based on profile completion status
    setTimeout(() => {
        if (user.profileComplete === true) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'completeProfile.html';
        }
    }, 1500);
}

// ============================================
// REGISTER FUNCTIONS
// ============================================

async function handleRegister(event) {
    event.preventDefault();
    
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone')?.value.trim() || '';
    const birthplace = document.getElementById('birthplace').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const address = document.getElementById('address')?.value.trim() || '';
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const terms = document.getElementById('terms').checked;
    const registerBtn = document.getElementById('register-btn');
    
    // Get selected bidang
    const selectedBidang = getSelectedBidang();
    
    // Reset messages
    hideError();
    hideSuccess();
    
    // Validation
    if (!fullname || !email || !birthplace || !birthdate || !password || !confirmPassword) {
        showError('Mohon isi semua field yang diperlukan');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Format email tidak valid');
        return;
    }
    
    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
        showError('Format nomor HP tidak valid. Gunakan format 08xxxxxxxxxx');
        return;
    }
    
    if (selectedBidang.length === 0) {
        showError('Pilih minimal satu bidang pertanian');
        return;
    }
    
    if (password.length < 8) {
        showError('Kata sandi minimal 8 karakter');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Konfirmasi kata sandi tidak cocok');
        return;
    }
    
    if (!terms) {
        showError('Anda harus menyetujui syarat dan ketentuan');
        return;
    }
    
    // Check if email already exists
    if (findUserByEmail(email)) {
        showError('Email sudah terdaftar. Silakan gunakan email lain atau masuk.');
        return;
    }
    
    // Show loading
    setButtonLoading(registerBtn, true);
    
    // Simulate API call delay
    await sleep(1500);
    
    // Generate unique User ID
    const userId = generateUniqueUserId();
    
    // Create user object
    const userData = {
        userId: userId,  // User ID unik (Nanoid 10 karakter)
        fullname,
        email,
        phone,
        birthplace,
        birthdate,
        bidang: selectedBidang,
        address,
        password: hashPassword(password),
        authProvider: 'email',
        profileComplete: true
    };
    
    // Save user
    addUser(userData);
    
    // Hide loading
    setButtonLoading(registerBtn, false);
    
    // Auto login after registration
    const newUser = findUserByEmail(email);
    setCurrentUser(newUser);
    
    // Show success modal with User ID
    showSuccessModal(userId);
}

// ============================================
// SUCCESS MODAL FUNCTIONS
// ============================================

let countdownInterval = null;

function showSuccessModal(userId) {
    const modal = document.getElementById('success-modal');
    const userIdElement = document.getElementById('modal-user-id');
    
    if (modal && userIdElement) {
        // Set User ID in modal
        userIdElement.textContent = userId;
        
        // Show modal
        modal.classList.add('show');
        
        // Start countdown
        startCountdown(10);
        
        console.log('✅ Success modal shown with User ID:', userId);
    }
}

function startCountdown(seconds) {
    const countdownElement = document.getElementById('countdown');
    let remaining = seconds;
    
    // Clear existing interval if any
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
        remaining--;
        if (countdownElement) {
            countdownElement.textContent = remaining;
        }
        
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            goToDashboard();
        }
    }, 1000);
}

function goToDashboard() {
    // Clear countdown interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Redirect to dashboard
    window.location.href = '../index.html';
}

function copyUserIdFromModal() {
    const userIdElement = document.getElementById('modal-user-id');
    const copyBtn = document.querySelector('.copy-btn');
    
    if (userIdElement) {
        const userId = userIdElement.textContent;
        
        // Copy to clipboard
        navigator.clipboard.writeText(userId).then(() => {
            // Update button to show copied state
            if (copyBtn) {
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<i class="fas fa-check"></i><span>Tersalin!</span>';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i><span>Salin</span>';
                }, 2000);
            }
            
            showToast('User ID berhasil disalin!', 'success');
        }).catch(err => {
            console.error('Gagal menyalin:', err);
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = userId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('User ID berhasil disalin!', 'success');
        });
    }
}



// ============================================
// GOOGLE OAUTH FUNCTIONS
// ============================================

function loadGoogleOAuth() {
    // Check if script already exists
    if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        console.log('Google OAuth script already loaded');
        return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
        console.log('✅ Google OAuth library loaded');
        googleLibraryLoaded = true;
        initializeGoogleOAuth();
    };
    script.onerror = () => {
        console.error('❌ Failed to load Google OAuth library');
        googleLibraryLoaded = false;
    };
    document.head.appendChild(script);
}

function initializeGoogleOAuth() {
    if (typeof google === 'undefined' || !google.accounts) {
        console.error('Google library not available');
        return;
    }
    
    try {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
            auto_select: false,
            cancel_on_tap_outside: true
        });
        console.log('✅ Google OAuth initialized');
    } catch (error) {
        console.error('Failed to initialize Google OAuth:', error);
    }
}

function handleGoogleLogin() {
    console.log('🔄 Starting Google Login...');
    
    if (!googleLibraryLoaded || typeof google === 'undefined') {
        showError('Google OAuth belum siap. Silakan coba lagi dalam beberapa detik.');
        setTimeout(() => {
            loadGoogleOAuth();
        }, 1000);
        return;
    }
    
    try {
        google.accounts.id.prompt((notification) => {
            console.log('Google prompt notification:', notification);
            
            if (notification.isNotDisplayed()) {
                console.log('Prompt not displayed, reason:', notification.getNotDisplayedReason());
                useGoogleOAuthPopup();
            } else if (notification.isSkippedMoment()) {
                console.log('Prompt skipped, reason:', notification.getSkippedReason());
                useGoogleOAuthPopup();
            } else if (notification.isDismissedMoment()) {
                console.log('Prompt dismissed, reason:', notification.getDismissedReason());
                if (notification.getDismissedReason() !== 'credential_returned') {
                    showToast('Login Google dibatalkan', 'error');
                }
            }
        });
    } catch (error) {
        console.error('Google prompt error:', error);
        useGoogleOAuthPopup();
    }
}

function useGoogleOAuthPopup() {
    console.log('🔄 Using OAuth popup method...');
    
    const clientId = GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'openid email profile';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(scope)}&` +
        `prompt=select_account`;
    
    window.location.href = authUrl;
}

function handleOAuthCallback() {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
        console.log('🔄 Processing OAuth callback...');
        
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            // Clear the hash from URL
            history.replaceState(null, null, window.location.pathname);
            
            // Fetch user info
            fetchGoogleUserInfo(accessToken);
        }
    }
}

async function fetchGoogleUserInfo(accessToken) {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        
        const userInfo = await response.json();
        console.log('Google user info:', userInfo);
        
        const googleUser = {
            googleId: userInfo.sub,
            email: userInfo.email,
            fullname: userInfo.name,
            picture: userInfo.picture
        };
        
        processGoogleUser(googleUser);
        
    } catch (error) {
        console.error('Error fetching Google user info:', error);
        showError('Gagal mengambil informasi dari Google');
    }
}

function handleGoogleCallback(response) {
    console.log('Google callback received');
    
    if (response.credential) {
        const payload = parseJwt(response.credential);
        console.log('Google user payload:', payload);
        
        const googleUser = {
            googleId: payload.sub,
            email: payload.email,
            fullname: payload.name,
            picture: payload.picture
        };
        
        processGoogleUser(googleUser);
    } else {
        console.error('No credential in Google response');
        showError('Gagal mendapatkan kredensial dari Google');
    }
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
    }
}

function processGoogleUser(googleUser) {
    console.log('Processing Google user:', googleUser.email);
    
    let user = findUserByEmail(googleUser.email);
    let isNewUser = false;
    
    if (!user) {
        console.log('📝 Creating new user from Google...');
        isNewUser = true;
        
        // Generate unique User ID untuk user baru
        const userId = generateUniqueUserId();
        
        // Create new user from Google data (minimal data, will be completed later)
        const userData = {
            userId: userId,  // User ID unik (Nanoid 10 karakter)
            fullname: googleUser.fullname,
            email: googleUser.email,
            birthplace: '',
            birthdate: '',
            bidang: [],
            password: hashPassword(googleUser.googleId + '_google_' + Date.now()),
            googleId: googleUser.googleId,
            picture: googleUser.picture,
            authProvider: 'google',
            profileComplete: false
        };
        
        addUser(userData);
        user = findUserByEmail(googleUser.email);
        
        console.log('✅ New user created with ID:', userId);
    } else {
        console.log('👤 Existing user found with ID:', user.userId);
        
        // Update existing user with Google info if not already linked
        if (!user.googleId) {
            user = updateUser(googleUser.email, {
                googleId: googleUser.googleId,
                picture: googleUser.picture || user.picture
            });
        }
    }
    
    // Login user (set session)
    setCurrentUser(user);
    
    // LANGSUNG REDIRECT tanpa delay
    if (user.profileComplete === true) {
        // Profile sudah lengkap, langsung ke dashboard
        console.log('✅ Profile complete, redirecting to dashboard...');
        window.location.href = '../index.html';
    } else {
        // Profile belum lengkap, LANGSUNG ke halaman complete profile
        console.log('📝 Profile incomplete, redirecting to completeProfile.html...');
        window.location.href = 'completeProfile.html';
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
        }
    }
    
    return selected;
}

// ============================================
// PASSWORD FUNCTIONS
// ============================================

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const eye = document.getElementById(inputId + '-eye');
    
    if (input.type === 'password') {
        input.type = 'text';
        eye.classList.remove('fa-eye');
        eye.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        eye.classList.remove('fa-eye-slash');
        eye.classList.add('fa-eye');
    }
}

function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('password-strength-bar');
    const hint = document.getElementById('password-hint');
    
    if (!strengthBar || !hint) return;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    // Update UI
    strengthBar.className = 'password-strength-bar';
    
    if (password.length === 0) {
        strengthBar.style.width = '0%';
        hint.textContent = 'Gunakan minimal 8 karakter dengan huruf dan angka';
    } else if (strength <= 2) {
        strengthBar.classList.add('weak');
        hint.textContent = 'Kata sandi lemah - tambahkan huruf besar dan angka';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        hint.textContent = 'Kata sandi sedang - tambahkan karakter khusus';
    } else {
        strengthBar.classList.add('strong');
        hint.textContent = 'Kata sandi kuat! 👍';
    }
}

// Simple hash function for demo (use bcrypt in production)
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
// UI HELPER FUNCTIONS
// ============================================

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.classList.add('show');
        
        // Scroll to error
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
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Indonesian phone format: starts with 08, 10-13 digits total
    const phoneRegex = /^08[0-9]{8,11}$/;
    return phoneRegex.test(phone);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleGoogleLogin = handleGoogleLogin;
window.togglePassword = togglePassword;
window.checkPasswordStrength = checkPasswordStrength;
window.logout = logout;
window.generateUserId = generateUserId;
window.generateUniqueUserId = generateUniqueUserId;
window.showSuccessModal = showSuccessModal;
window.goToDashboard = goToDashboard;
window.copyUserIdFromModal = copyUserIdFromModal;