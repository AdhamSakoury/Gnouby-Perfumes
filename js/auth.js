// Authentication functions - COMPATIBLE VERSION
const AUTH_KEY = 'gnouby_auth';
const USERS_KEY = 'gnouby_users';

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Save single user (updates existing or adds new)
function saveUser(user) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    
    if (index !== -1) {
        // Update existing user - preserve password if not provided
        const existingUser = users[index];
        users[index] = {
            ...existingUser,
            ...user,
            password: user.password || existingUser.password
        };
    } else {
        users.push(user);
    }
    
    saveUsers(users);
}

function getCurrentUser() {
    // Check localStorage first (persistent), then sessionStorage (temporary)
    const localUser = localStorage.getItem(AUTH_KEY);
    const sessionUser = sessionStorage.getItem(AUTH_KEY);
    
    const userJson = localUser || sessionUser;
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    
    // Sync with users array to get latest data
    const users = getUsers();
    const fullUser = users.find(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    
    return fullUser || user;
}

function setCurrentUser(user, remember = true) {
    // Store in localStorage for persistence
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    
    // Also store in sessionStorage as backup
    if (remember) {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
}

function updateCurrentUser(userData) {
    // Update in both storages
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(userData));
}

function clearCurrentUser() {
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_KEY);
}

function register(fullName, email, password, phone = '', address = '') {
    const users = getUsers();
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'Email already registered' };
    }
    
    const newUser = {
        id: 'user_' + Date.now(),
        fullName,
        name: fullName,
        email: email.toLowerCase(),
        password,
        phone: phone || '',
        address: address || '',
        profilePhoto: null,
        orders: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto login
    setCurrentUser(newUser, true);
    
    return { success: true, user: newUser };
}

function login(email, password, remember = true) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        return { success: false, message: 'Email not found' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password' };
    }
    
    // Store full user with password for profile updates
    setCurrentUser(user, remember);
    
    return { success: true, user: user };
}

function logout() {
    clearCurrentUser();
    window.location.href = 'index.html';
}

function requireAuth(redirectUrl) {
    if (!getCurrentUser()) {
        window.location.href = `login.html?redirect=${encodeURIComponent(redirectUrl || window.location.pathname)}`;
        return false;
    }
    return true;
}

function updateAuthUI() {
    const user = getCurrentUser();
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userNameEl = document.getElementById('user-name');
    const mobileAuthSection = document.getElementById('mobile-auth-section');
    const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
    const mobileUserMenu = document.getElementById('mobile-user-menu');
    const mobileUserName = document.getElementById('mobile-user-name');
    
    if (user) {
        // Desktop: Show user menu, hide auth buttons
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) {
            userMenu.classList.remove('hidden');
            if (userNameEl) userNameEl.textContent = user.fullName.split(' ')[0];
        }
        
        // Mobile: Show user menu, hide auth buttons
        if (mobileAuthButtons) mobileAuthButtons.classList.add('hidden');
        if (mobileUserMenu) {
            mobileUserMenu.classList.remove('hidden');
            if (mobileUserName) mobileUserName.textContent = user.fullName;
        }
    } else {
        // Desktop: Show auth buttons, hide user menu
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
        
        // Mobile: Show auth buttons, hide user menu
        if (mobileAuthButtons) mobileAuthButtons.classList.remove('hidden');
        if (mobileUserMenu) mobileUserMenu.classList.add('hidden');
    }
}

// Initialize auth UI on all pages
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    
    // Setup user dropdown toggle
    const userDropdownBtn = document.getElementById('user-dropdown-btn');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userDropdownBtn && userDropdown) {
        userDropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userDropdownBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
    
    // Setup logout buttons
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnNav = document.getElementById('logout-btn-nav');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (logoutBtnNav) logoutBtnNav.addEventListener('click', logout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', logout);
});