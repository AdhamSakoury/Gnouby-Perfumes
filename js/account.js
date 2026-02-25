// Account page functionality for Gnouby Perfumes - Clean Version

document.addEventListener('DOMContentLoaded', function() {
    // Initialize shared features from external files
    if (typeof initDarkMode === 'function') initDarkMode();
    if (typeof updateCartCount === 'function') updateCartCount();
    
    // Check if auth is loaded
    if (typeof getCurrentUser !== 'function') {
        console.error('Auth library not loaded');
        return;
    }
    
    const user = getCurrentUser();
    const loginPrompt = document.getElementById('login-prompt');
    const accountContent = document.getElementById('account-content');
    
    if (!user) {
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        if (accountContent) accountContent.classList.add('hidden');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=account.html';
        }, 2000);
    } else {
        if (loginPrompt) loginPrompt.classList.add('hidden');
        if (accountContent) accountContent.classList.remove('hidden');
        loadAccountInfo();
        initEditProfileModal();
        initOrderHistory();
    }
});

function loadAccountInfo() {
    const user = getCurrentUser();
    if (!user) return;
    
    const nameDisplay = document.getElementById('user-name-display');
    const emailDisplay = document.getElementById('user-email-display');
    const phoneDisplay = document.getElementById('user-phone-display');
    const addressDisplay = document.getElementById('user-address-display');
    const initialsDisplay = document.getElementById('user-initials');
    const navUserName = document.getElementById('nav-user-name');
    
    const fullName = user.fullName || user.name || 'User';
    
    if (nameDisplay) nameDisplay.textContent = fullName;
    if (navUserName) navUserName.textContent = fullName;
    
    if (emailDisplay) emailDisplay.textContent = user.email || 'Not provided';
    if (phoneDisplay) phoneDisplay.textContent = user.phone ? user.phone : 'Not provided';
    if (addressDisplay) addressDisplay.textContent = user.address ? user.address : 'Not provided';
    
    if (initialsDisplay) {
        const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        initialsDisplay.textContent = initials || 'U';
    }
    
    const wishlist = user.wishlist || [];
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) wishlistCount.textContent = wishlist.length;
    
    const orders = user.orders || [];
    updateStats(orders.length, wishlist.length);
    
    loadRecentActivity();
}

function updateStats(orderCount, wishlistCount) {
    const ordersStat = document.getElementById('stat-orders');
    const wishlistStat = document.getElementById('stat-wishlist');
    
    if (ordersStat) ordersStat.textContent = orderCount || 0;
    if (wishlistStat) wishlistStat.textContent = wishlistCount || 0;
}

function loadRecentActivity() {
    const user = getCurrentUser();
    const activityContainer = document.getElementById('recent-activity');
    
    if (!activityContainer) return;
    
    if (!user?.orders || user.orders.length === 0) {
        activityContainer.innerHTML = `
            <div class="text-center py-12">
                <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-nubian-sand/30 dark:bg-nubian-dark/50 flex items-center justify-center">
                    <i class="fas fa-inbox text-3xl text-nubian-gold/50"></i>
                </div>
                <p class="text-nubian-earth dark:text-nubian-sand/70 text-lg">No recent activity to display</p>
                <p class="text-sm text-nubian-earth/60 dark:text-nubian-sand/50 mt-1">Your recent orders will appear here</p>
            </div>
        `;
        return;
    }
    
    const recentOrders = user.orders.slice(-3).reverse();
    
    activityContainer.innerHTML = recentOrders.map((order, index) => `
        <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-nubian-sand/20 to-transparent dark:from-nubian-dark/40 dark:to-transparent rounded-xl border border-nubian-gold/10 hover:border-nubian-gold/30 transition-all duration-300 group animate-fade-in" style="animation-delay: ${index * 100}ms">
            <div class="w-14 h-14 bg-gradient-to-br from-nubian-brown to-nubian-earth rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <i class="fas fa-shopping-bag text-nubian-gold text-xl"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <p class="font-bold text-nubian-brown dark:text-white truncate">Order #${order.id}</p>
                    <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <p class="text-sm text-nubian-earth dark:text-nubian-sand/70">
                    <i class="far fa-calendar-alt mr-1"></i> ${formatDate(order.date)}
                    <span class="mx-2">•</span>
                    <i class="fas fa-tag mr-1"></i> $${order.total.toFixed(2)}
                </p>
            </div>
            <button onclick="reorderItems('${order.id}')" class="p-2 rounded-lg hover:bg-nubian-gold/20 text-nubian-gold transition-colors" title="Reorder">
                <i class="fas fa-redo"></i>
            </button>
        </div>
    `).join('');
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
        setTimeout(() => document.getElementById('edit-name')?.focus(), 100);
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
        if (!user) {
            if (typeof showToast === 'function') showToast('User not found', 'error');
            return;
        }
        
        const fullName = document.getElementById('edit-name').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();
        const address = document.getElementById('edit-address').value.trim();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!fullName || !email) {
            if (typeof showToast === 'function') showToast('Name and email are required', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (typeof showToast === 'function') showToast('Please enter a valid email address', 'error');
            return;
        }
        
        if (email.toLowerCase() !== user.email.toLowerCase()) {
            const users = typeof getUsers === 'function' ? getUsers() : [];
            const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (existingUser) {
                if (typeof showToast === 'function') showToast('Email address is already in use', 'error');
                return;
            }
        }
        
        if (newPassword) {
            if (!currentPassword) {
                if (typeof showToast === 'function') showToast('Current password is required to set a new password', 'error');
                return;
            }
            if (currentPassword !== user.password) {
                if (typeof showToast === 'function') showToast('Current password is incorrect', 'error');
                return;
            }
            if (newPassword.length < 6) {
                if (typeof showToast === 'function') showToast('New password must be at least 6 characters', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                if (typeof showToast === 'function') showToast('New passwords do not match', 'error');
                return;
            }
        }
        
        const updatedUser = {
            ...user,
            fullName: fullName,
            name: fullName,
            email: email.toLowerCase(),
            phone: phone,
            address: address,
            updatedAt: new Date().toISOString()
        };
        
        if (newPassword) {
            updatedUser.password = newPassword;
        }
        
        if (typeof saveUser === 'function') saveUser(updatedUser);
        if (typeof updateCurrentUser === 'function') updateCurrentUser(updatedUser);
        
        loadAccountInfo();
        closeModal();
        if (typeof showToast === 'function') showToast('Profile updated successfully!', 'success');
        
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    });
}

function initOrderHistory() {
    const viewOrdersBtn = document.getElementById('view-orders-btn');
    const ordersModal = document.getElementById('orders-modal');
    const closeOrdersBtn = document.getElementById('close-orders-modal');
    const ordersOverlay = document.getElementById('orders-overlay');
    
    if (!viewOrdersBtn || !ordersModal) return;
    
    viewOrdersBtn.addEventListener('click', function() {
        loadOrderHistory();
        ordersModal.classList.remove('hidden');
        ordersOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    function closeOrdersModal() {
        ordersModal.classList.add('hidden');
        ordersOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    closeOrdersBtn?.addEventListener('click', closeOrdersModal);
    ordersOverlay?.addEventListener('click', closeOrdersModal);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !ordersModal.classList.contains('hidden')) {
            closeOrdersModal();
        }
    });
}

function loadOrderHistory() {
    const user = getCurrentUser();
    const ordersContainer = document.getElementById('orders-list');
    
    if (!ordersContainer) return;
    
    const orders = user?.orders || [];
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="text-center py-16">
                <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-nubian-sand/30 to-nubian-gold/10 flex items-center justify-center">
                    <i class="fas fa-shopping-bag text-4xl text-nubian-gold/50"></i>
                </div>
                <p class="text-gray-500 text-lg dark:text-gray-400 font-medium">No orders yet</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-2 mb-6">Start shopping to see your orders here</p>
                <a href="perfumes.html" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-nubian-brown to-nubian-earth dark:from-nubian-gold dark:to-nubian-terracotta text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold">
                    <i class="fas fa-store"></i>
                    Start Shopping
                </a>
            </div>
        `;
        return;
    }
    
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    ordersContainer.innerHTML = orders.map((order, index) => `
        <div class="border border-gray-200 rounded-2xl p-6 mb-4 hover:shadow-xl transition-all duration-300 dark:border-gray-700 dark:bg-gray-800/50 group animate-fade-in" style="animation-delay: ${index * 50}ms">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <div class="flex items-center gap-3 mb-1">
                        <p class="font-bold text-lg dark:text-white">Order #${order.id}</p>
                        <span class="order-status status-${order.status.toLowerCase().replace(/\s+/g, '-')}">${order.status}</span>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <i class="far fa-calendar"></i> ${formatDate(order.date)}
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-2xl font-bold text-nubian-brown dark:text-nubian-gold font-cinzel">$${order.total.toFixed(2)}</p>
                </div>
            </div>
            
            <div class="space-y-3 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
                ${order.items.map(item => `
                    <div class="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 group-hover:bg-white dark:group-hover:bg-gray-700/50 transition-colors">
                        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg shadow-md" onerror="this.src='https://via.placeholder.com/64'">
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold dark:text-white truncate">${item.name}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Qty: ${item.quantity} × $${item.price.toFixed(2)}</p>
                        </div>
                        <p class="font-bold text-nubian-brown dark:text-nubian-gold">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="border-t border-gray-200 pt-4 flex justify-between items-center dark:border-gray-700">
                <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <i class="fas fa-truck"></i>
                    <span>Standard Shipping</span>
                </div>
                <button onclick="reorderItems('${order.id}')" class="px-5 py-2.5 bg-gradient-to-r from-nubian-brown to-nubian-earth dark:from-nubian-gold dark:to-nubian-terracotta text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold flex items-center gap-2">
                    <i class="fas fa-redo"></i>
                    Reorder
                </button>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function reorderItems(orderId) {
    const user = getCurrentUser();
    const order = user?.orders?.find(o => o.id === orderId);
    
    if (!order || typeof addToCart !== 'function') return;
    
    order.items.forEach(item => {
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            brand: item.brand,
            quantity: item.quantity
        });
    });
    
    if (typeof showToast === 'function') showToast('Items added to cart!', 'success');
    if (typeof updateCartCount === 'function') updateCartCount();
    
    const ordersModal = document.getElementById('orders-modal');
    const ordersOverlay = document.getElementById('orders-overlay');
    if (ordersModal && !ordersModal.classList.contains('hidden')) {
        ordersModal.classList.add('hidden');
        ordersOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Add fade-in animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fade-in 0.5s ease-out forwards;
        opacity: 0;
    }
`;
document.head.appendChild(style);