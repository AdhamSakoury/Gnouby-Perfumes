// Account page functionality
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    
    if (!requireAuth('account.html')) return;
    
    updateAuthUI();
    updateCartCount();
    updateWishlistCount();
    loadAccountInfo();
    initEditProfileModal();
    
    document.getElementById('logout-btn')?.addEventListener('click', logout);
});

function loadAccountInfo() {
    const user = getCurrentUser();
    if (!user) return;
    
    const nameDisplay = document.getElementById('user-name-display');
    const emailDisplay = document.getElementById('user-email-display');
    const wishlistCount = document.getElementById('wishlist-count');
    
    if (nameDisplay) nameDisplay.textContent = user.fullName || user.name || 'User';
    if (emailDisplay) emailDisplay.textContent = user.email || 'user@example.com';
    if (wishlistCount) wishlistCount.textContent = getWishlistCount();
}

function initEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    const openBtn = document.getElementById('edit-profile-btn');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-edit');
    const form = document.getElementById('edit-profile-form');
    const overlay = document.getElementById('modal-overlay');
    
    if (!modal || !openBtn) return;
    
    openBtn.addEventListener('click', function() {
        const user = getCurrentUser();
        if (user) {
            document.getElementById('edit-name').value = user.fullName || user.name || '';
            document.getElementById('edit-email').value = user.email || '';
            document.getElementById('edit-phone').value = user.phone || '';
            document.getElementById('edit-address').value = user.address || '';
        }
        
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    function closeModal() {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    form?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const user = getCurrentUser();
        if (!user) return;
        
        const fullName = document.getElementById('edit-name').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();
        const address = document.getElementById('edit-address').value.trim();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!fullName || !email) {
            showToast('Name and email are required', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        if (email !== user.email) {
            const users = JSON.parse(localStorage.getItem('gnouby_users') || '[]');
            const existingUser = users.find(u => u.email === email && u.id !== user.id);
            if (existingUser) {
                showToast('Email address is already in use', 'error');
                return;
            }
        }
        
        if (newPassword) {
            if (!currentPassword) {
                showToast('Current password is required to set a new password', 'error');
                return;
            }
            if (currentPassword !== user.password) {
                showToast('Current password is incorrect', 'error');
                return;
            }
            if (newPassword.length < 6) {
                showToast('New password must be at least 6 characters', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match', 'error');
                return;
            }
        }
        
        user.fullName = fullName;
        user.name = fullName;
        user.email = email;
        user.phone = phone;
        user.address = address;
        
        if (newPassword) {
            user.password = newPassword;
        }
        
        localStorage.setItem('gnouby_current_user', JSON.stringify(user));
        
        let users = JSON.parse(localStorage.getItem('gnouby_users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id || u.email === user.email);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('gnouby_users', JSON.stringify(users));
        }
        
        loadAccountInfo();
        updateAuthUI();
        
        closeModal();
        showToast('Profile updated successfully!', 'success');
        
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    });
}

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('active'), 100);
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}