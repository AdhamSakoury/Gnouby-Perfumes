// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    
    // Check if already logged in
    if (getCurrentUser()) {
        const redirect = new URLSearchParams(window.location.search).get('redirect') || 'account.html';
        window.location.href = redirect;
        return;
    }
    
    // Toggle password visibility
    const toggleBtn = document.getElementById('toggle-password');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const password = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (password.type === 'password') {
                password.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                password.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Form submission
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
});

function handleLogin(e) {
    e.preventDefault();
    clearAllErrors();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember-me')?.checked || false;
    
    let isValid = true;
    
    if (!validateEmail(email)) {
        showError('email-error', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (password.length < 6) {
        showError('password-error', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (!isValid) return;
    
    const result = login(email, password);
    
    if (result.success) {
        setCurrentUser(result.user, remember);
        
        const btn = document.getElementById('submit-btn');
        btn.innerHTML = '<i class="fas fa-check mr-2"></i> Success!';
        btn.classList.remove('bg-nubian-brown');
        btn.classList.add('bg-green-600');
        
        setTimeout(() => {
            const redirect = new URLSearchParams(window.location.search).get('redirect') || 'account.html';
            window.location.href = redirect;
        }, 1000);
    } else {
        showError('email-error', result.message);
    }
}