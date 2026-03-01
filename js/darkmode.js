// ==========================================
// DARK MODE - SINGLE SOURCE OF TRUTH
// ==========================================

const DARK_MODE_KEY = 'gnouby_dark_mode';

// ==========================================
// EARLY APPLICATION (Prevent flash)
// ==========================================

(function applyEarly() {
    const saved = localStorage.getItem(DARK_MODE_KEY);
    if (saved === 'true') {
        document.documentElement.classList.add('dark');
    }
})();

// ==========================================
// DOM READY INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const isDark = document.documentElement.classList.contains('dark');
    updateAllUI(isDark);
    bindAllToggles();
});

// ==========================================
// TOGGLE HANDLING
// ==========================================

function bindAllToggles() {
    // Find ALL dark mode toggle buttons on the page
    const toggles = document.querySelectorAll('#dark-mode-toggle, #dark-mode-toggle-mobile');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', handleToggle);
    });
}

function handleToggle() {
    const html = document.documentElement;
    const willBeDark = !html.classList.contains('dark');
    
    if (willBeDark) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
    
    localStorage.setItem(DARK_MODE_KEY, willBeDark.toString());
    updateAllUI(willBeDark);
}

// ==========================================
// UI UPDATES
// ==========================================

function updateAllUI(isDark) {
    // Update ALL toggle icons (desktop + mobile)
    const icons = document.querySelectorAll('#dark-mode-toggle i, #dark-mode-toggle-mobile i');
    icons.forEach(icon => {
        icon.className = isDark 
            ? 'fas fa-sun text-nubian-gold text-xl'
            : 'fas fa-moon text-nubian-brown text-xl';
    });
    
    // Update logo if exists
    const logo = document.getElementById('logo-img');
    if (logo) {
        logo.src = isDark ? 'images/logo-dark.png' : 'images/logo-light.png';
    }
}