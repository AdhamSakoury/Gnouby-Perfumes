// Dark mode functionality with logo switching
const DARK_MODE_KEY = 'gnouby_dark_mode';

function initDarkMode() {
    const isDark = localStorage.getItem(DARK_MODE_KEY) === 'true';
    if (isDark) {
        document.documentElement.classList.add('dark');
    }
    
    updateLogo(isDark);
    
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleDarkMode);
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(DARK_MODE_KEY, isDark.toString());
    
    updateLogo(isDark);
    updateIcon(isDark);
}

function updateLogo(isDark) {
    const logoImg = document.getElementById('logo-img');
    if (logoImg) {
        logoImg.src = isDark ? 'images/logo-dark.png' : 'images/logo-light.png';
    }
}

function updateIcon(isDark) {
    const icon = document.querySelector('#dark-mode-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun text-nubian-gold text-xl' : 'fas fa-moon text-nubian-brown text-xl';
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
    initDarkMode();
}