// Authentication functions
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
        users[index] = { ...users[index], ...user };
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
    
    // Sync with users array to get latest data (including profile updates)
    const users = getUsers();
    const fullUser = users.find(u => u.id === user.id);
    
    return fullUser || user;
}

function setCurrentUser(user, remember = true) { // Default to true for persistence
    // Always store in localStorage for persistence
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    
    // Also store in sessionStorage as backup
    if (remember) {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
        sessionStorage.removeItem(AUTH_KEY);
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
        password, // Store password for profile updates
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
    
    // Auto login - store full user
    setCurrentUser(newUser, true);
    
    return { success: true, user: newUser };
}

function login(email, password, remember = true) { // Default to true
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        return { success: false, message: 'Email not found' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password' };
    }
    
    // Store full user with password
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
    const userName = document.getElementById('user-name');
    const mobileAuthLinks = document.getElementById('mobile-auth-links');
    
    if (user) {
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) {
            userMenu.classList.remove('hidden');
            // Update user name in dropdown
            const userNameEl = userMenu.querySelector('#user-name');
            if (userNameEl) userNameEl.textContent = user.fullName.split(' ')[0];
        }
        if (userName) userName.textContent = user.fullName.split(' ')[0];
        if (mobileAuthLinks) {
            mobileAuthLinks.innerHTML = `
                <a href="account.html" class="block py-2 text-nubian-gold">My Account</a>
                <button onclick="logout()" class="block py-2 text-red-500 w-full text-left">Logout</button>
            `;
        }
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
        if (mobileAuthLinks) {
            mobileAuthLinks.innerHTML = `<a href="login.html" class="block py-2 text-nubian-gold">Login</a>`;
        }
    }
}

// Initialize auth UI on all pages
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
});