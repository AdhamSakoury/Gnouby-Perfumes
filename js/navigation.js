// ==========================================
// NAVIGATION ONLY (No dark mode here)
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
});

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        });
    }

    const mobileLinks = mobileMenu?.querySelectorAll('a');
    mobileLinks?.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuBtn?.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}