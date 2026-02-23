// Register page functionality
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    
    // Check if already logged in
    if (getCurrentUser()) {
        window.location.href = 'account.html';
        return;
    }
    
    // Password strength meter
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Toggle password visibility
    document.getElementById('toggle-password')?.addEventListener('click', function() {
        togglePasswordVisibility('password', this);
    });
    
    document.getElementById('toggle-confirm-password')?.addEventListener('click', function() {
        togglePasswordVisibility('confirmPassword', this);
    });
    
    // Form submission
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', handleRegister);
    }
});

function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const strength = calculateStrength(password);
    
    const colors = ['bg-gray-200', 'bg-nubian-terracotta', 'bg-yellow-500', 'bg-nubian-gold', 'bg-green-500'];
    
    for (let i = 1; i <= 4; i++) {
        const bar = document.getElementById(`strength-${i}`);
        if (bar) {
            if (i <= strength) {
                bar.className = `flex-1 password-strength ${colors[strength]}`;
            } else {
                bar.className = 'flex-1 password-strength bg-gray-200';
            }
        }
    }
}

function calculateStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
}

function togglePasswordVisibility(fieldId, btn) {
    const field = document.getElementById(fieldId);
    const icon = btn.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function handleRegister(e) {
    e.preventDefault();
    clearAllErrors();
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    let isValid = true;
    
    if (fullName.length < 2) {
        showError('fullName-error', 'Please enter your full name');
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        showError('email-error', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (password.length < 8) {
        showError('password-error', 'Password must be at least 8 characters');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('password-error', 'Password must contain uppercase, lowercase, number, and special character');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPassword-error', 'Passwords do not match');
        isValid = false;
    }
    
    if (!terms) {
        showError('terms-error', 'You must agree to the terms');
        isValid = false;
    }
    
    if (!isValid) return;
    
    const result = register(fullName, email, password);
    
    if (result.success) {
        const btn = document.getElementById('submit-btn');
        btn.innerHTML = '<i class="fas fa-check mr-2"></i> Account Created!';
        btn.classList.remove('bg-nubian-brown');
        btn.classList.add('bg-green-600');
        
        setTimeout(() => {
            window.location.href = 'account.html';
        }, 1500);
    } else {
        showError('email-error', result.message);
    }
}