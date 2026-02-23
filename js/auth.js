// Authentication functions
const AUTH_KEY = 'gnouby_auth';
const USERS_KEY = 'gnouby_users';

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY));
}

function setCurrentUser(user, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_KEY);
}

function register(fullName, email, password) {
    const users = getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'Email already registered' };
    }
    
    const newUser = {
        id: Date.now(),
        fullName,
        email: email.toLowerCase(),
        password, // In real app, hash this!
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto login
    const { password: _, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    
    return { success: true, user: userWithoutPassword };
}

function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        return { success: false, message: 'Email not found' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password' };
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
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
        if (userMenu) userMenu.classList.remove('hidden');
        if (userName) userName.textContent = user.fullName.split(' ')[0];
        if (mobileAuthLinks) mobileAuthLinks.innerHTML = `<a href="account.html" class="block py-2 text-nubian-gold">My Account</a>`;
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }
}