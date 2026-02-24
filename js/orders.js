// Orders page functionality for Gnouby Perfumes
// Compatible with existing auth.js (uses AUTH_KEY = 'gnouby_auth')

// State management
let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
let ordersPerPage = 5;
let currentFilter = 'all';
let currentSort = 'newest';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', function() {
    // Wait for DOM and auth to be ready
    setTimeout(() => {
        initializeOrders();
    }, 100);
});

function initializeOrders() {
    const user = getCurrentUser();
    const loginPrompt = document.getElementById('login-prompt');
    const ordersContent = document.getElementById('orders-content');
    
    if (!user) {
        // Not logged in
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        if (ordersContent) ordersContent.classList.add('hidden');
        return;
    }
    
    // Logged in - show content
    if (loginPrompt) loginPrompt.classList.add('hidden');
    if (ordersContent) ordersContent.classList.remove('hidden');
    
    // Load orders from user data (user.orders from your auth system)
    allOrders = user.orders || [];
    
    // Update stats
    updateStats();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initial display
    applyFilters();
    
    // Update cart count if function exists
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

// ==========================================
// STATS & DISPLAY
// ==========================================

function updateStats() {
    const total = allOrders.length;
    const processing = allOrders.filter(o => o.status === 'Processing').length;
    const shipped = allOrders.filter(o => o.status === 'Shipped').length;
    const delivered = allOrders.filter(o => o.status === 'Delivered').length;
    
    const statTotal = document.getElementById('stat-total');
    const statProcessing = document.getElementById('stat-processing');
    const statShipped = document.getElementById('stat-shipped');
    const statDelivered = document.getElementById('stat-delivered');
    const totalBadge = document.getElementById('total-orders-badge');
    
    if (statTotal) statTotal.textContent = total;
    if (statProcessing) statProcessing.textContent = processing;
    if (statShipped) statShipped.textContent = shipped;
    if (statDelivered) statDelivered.textContent = delivered;
    if (totalBadge) totalBadge.textContent = `${total} Order${total !== 1 ? 's' : ''}`;
}

function applyFilters() {
    // Filter by status
    if (currentFilter === 'all') {
        filteredOrders = [...allOrders];
    } else {
        filteredOrders = allOrders.filter(order => 
            order.status && order.status.toLowerCase() === currentFilter.toLowerCase()
        );
    }
    
    // Filter by search query
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
            (order.id && order.id.toLowerCase().includes(query)) ||
            (order.items && order.items.some(item => 
                item.name && item.name.toLowerCase().includes(query)
            ))
        );
    }
    
    // Sort
    sortOrders();
    
    // Display
    displayOrders();
}

function sortOrders() {
    switch (currentSort) {
        case 'newest':
            filteredOrders.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            break;
        case 'oldest':
            filteredOrders.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
            break;
        case 'highest':
            filteredOrders.sort((a, b) => (b.total || 0) - (a.total || 0));
            break;
        case 'lowest':
            filteredOrders.sort((a, b) => (a.total || 0) - (b.total || 0));
            break;
    }
}

function displayOrders() {
    const container = document.getElementById('orders-list');
    const emptyState = document.getElementById('empty-orders');
    const noSearchResults = document.getElementById('no-search-results');
    const pagination = document.getElementById('pagination');
    
    if (!container) return;
    
    // Show empty state if no orders at all
    if (allOrders.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        if (noSearchResults) noSearchResults.classList.add('hidden');
        if (pagination) pagination.classList.add('hidden');
        return;
    }
    
    // Show no search results if filters return nothing
    if (filteredOrders.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.add('hidden');
        if (noSearchResults) noSearchResults.classList.remove('hidden');
        if (pagination) pagination.classList.add('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    if (noSearchResults) noSearchResults.classList.add('hidden');
    
    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const start = (currentPage - 1) * ordersPerPage;
    const end = start + ordersPerPage;
    const pageOrders = filteredOrders.slice(start, end);
    
    // Display orders
    container.innerHTML = pageOrders.map(order => createOrderCard(order)).join('');
    
    // Setup pagination
    if (totalPages > 1) {
        if (pagination) pagination.classList.remove('hidden');
        setupPagination(totalPages);
    } else {
        if (pagination) pagination.classList.add('hidden');
    }
    
    // Add click listeners to order cards
    document.querySelectorAll('.order-card').forEach(card => {
        card.addEventListener('click', () => {
            const orderId = card.dataset.orderId;
            openOrderModal(orderId);
        });
    });
}

function createOrderCard(order) {
    const firstItem = order.items && order.items[0] ? order.items[0] : { 
        name: 'Unknown Product', 
        image: 'https://via.placeholder.com/80/1B4D4D/FFFFFF?text=Product' 
    };
    const moreItems = (order.items ? order.items.length : 0) - 1;
    
    const date = order.date ? new Date(order.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : 'Unknown Date';
    
    const status = order.status || 'Pending';
    const total = order.total || 0;
    
    return `
        <div class="order-card bg-white dark:bg-nubian-earth rounded-xl p-6 border border-nubian-gold/20 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-nubian-gold/40" data-order-id="${order.id}">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="relative">
                        <img src="${firstItem.image}" alt="${firstItem.name}" 
                            class="w-20 h-20 object-cover rounded-lg order-item-image"
                            onerror="this.src='https://via.placeholder.com/80/1B4D4D/FFFFFF?text=Product'">
                        ${moreItems > 0 ? `
                            <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-nubian-gold text-nubian-dark rounded-full flex items-center justify-center text-xs font-bold">
                                +${moreItems}
                            </div>
                        ` : ''}
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-sm text-nubian-earth dark:text-nubian-sand">Order #${order.id}</span>
                            <span class="order-status status-${status.toLowerCase()}">${status}</span>
                        </div>
                        <h3 class="font-semibold text-nubian-brown dark:text-nubian-sand text-lg mb-1">${firstItem.name}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${date} • ${order.items ? order.items.length : 0} item${(order.items ? order.items.length : 0) !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div class="flex items-center justify-between md:flex-col md:items-end gap-2">
                    <span class="text-xl font-bold text-nubian-gold">$${total.toFixed(2)}</span>
                    <button class="text-sm text-nubian-brown dark:text-nubian-sand hover:text-nubian-gold transition-colors flex items-center gap-1">
                        View Details <i class="fas fa-chevron-right text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// PAGINATION
// ==========================================

function setupPagination(totalPages) {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    let html = '';
    
    // Previous button
    html += `
        <button onclick="changePage(${currentPage - 1})" 
            class="pagination-btn px-4 py-2 rounded-lg border border-nubian-sand dark:border-nubian-dark ${currentPage === 1 ? 'disabled' : ''}" 
            ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `
                <button onclick="changePage(${i})" 
                    class="pagination-btn px-4 py-2 rounded-lg border border-nubian-sand dark:border-nubian-dark ${i === currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="px-2 text-nubian-earth dark:text-nubian-sand">...</span>`;
        }
    }
    
    // Next button
    html += `
        <button onclick="changePage(${currentPage + 1})" 
            class="pagination-btn px-4 py-2 rounded-lg border border-nubian-sand dark:border-nubian-dark ${currentPage === totalPages ? 'disabled' : ''}" 
            ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    displayOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// ORDER MODAL
// ==========================================

function openOrderModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const overlay = document.getElementById('order-modal-overlay');
    const modal = document.getElementById('order-details-modal');
    
    // Populate modal content
    const orderIdEl = document.getElementById('modal-order-id');
    const orderDateEl = document.getElementById('modal-order-date');
    const timelineEl = document.getElementById('order-timeline');
    const itemsEl = document.getElementById('modal-order-items');
    const addressEl = document.getElementById('modal-shipping-address');
    const subtotalEl = document.getElementById('modal-subtotal');
    const discountRow = document.getElementById('modal-discount-row');
    const discountEl = document.getElementById('modal-discount');
    const totalEl = document.getElementById('modal-total');
    
    if (orderIdEl) orderIdEl.textContent = `Order #${order.id}`;
    if (orderDateEl) {
        orderDateEl.textContent = order.date ? new Date(order.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '';
    }
    
    // Timeline
    const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentStepIndex = statusSteps.indexOf(order.status || 'Pending');
    
    if (timelineEl) {
        timelineEl.innerHTML = statusSteps.map((step, index) => {
            let statusClass = 'pending';
            let icon = index + 1;
            
            if (index < currentStepIndex) {
                statusClass = 'completed';
                icon = '<i class="fas fa-check text-sm"></i>';
            } else if (index === currentStepIndex) {
                statusClass = 'active';
            }
            
            return `
                <div class="flex items-start gap-4">
                    <div class="timeline-dot ${statusClass}">${icon}</div>
                    <div>
                        <p class="font-semibold text-nubian-brown dark:text-nubian-sand">${step}</p>
                        ${index === currentStepIndex ? '<p class="text-sm text-nubian-gold">Current Status</p>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Items
    if (itemsEl) {
        itemsEl.innerHTML = (order.items || []).map(item => `
            <div class="flex items-center gap-4 p-3 bg-nubian-sand/10 dark:bg-nubian-dark/20 rounded-lg">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg" 
                    onerror="this.src='https://via.placeholder.com/64/1B4D4D/FFFFFF?text=Product'">
                <div class="flex-1">
                    <h4 class="font-medium text-nubian-brown dark:text-nubian-sand">${item.name}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Qty: ${item.quantity || 1}</p>
                </div>
                <span class="font-semibold text-nubian-gold">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
            </div>
        `).join('');
    }
    
    // Address
    if (addressEl) {
        const addr = order.shippingAddress || {};
        addressEl.innerHTML = `
            <p class="font-medium">${addr.name || 'N/A'}</p>
            <p>${addr.street || ''}</p>
            <p>${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}</p>
            <p>${addr.country || ''}</p>
        `;
    }
    
    // Summary
    if (subtotalEl) subtotalEl.textContent = '$' + (order.subtotal || order.total || 0).toFixed(2);
    if (discountEl) discountEl.textContent = '-$' + (order.discount || 0).toFixed(2);
    if (discountRow) discountRow.classList.toggle('hidden', !(order.discount > 0));
    if (totalEl) totalEl.textContent = '$' + (order.total || 0).toFixed(2);
    
    // Show modal
    if (overlay) overlay.classList.remove('hidden');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    // Close button
    const closeBtn = document.getElementById('close-modal');
    if (closeBtn) {
        closeBtn.onclick = closeOrderModal;
    }
    
    // Reorder button
    const reorderBtn = document.getElementById('reorder-btn');
    if (reorderBtn) {
        reorderBtn.onclick = () => reorder(order.id);
    }
}

function closeOrderModal() {
    const overlay = document.getElementById('order-modal-overlay');
    const modal = document.getElementById('order-details-modal');
    
    if (overlay) overlay.classList.add('hidden');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function reorder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order || !order.items) return;
    
    // Add items to cart
    order.items.forEach(item => {
        if (typeof addToCart === 'function') {
            addToCart({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity || 1
            });
        }
    });
    
    closeOrderModal();
    
    // Show toast if function exists
    if (typeof showToast === 'function') {
        showToast('Items added to cart!', 'success');
    }
    
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 1000);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            applyFilters();
        });
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('sort-orders');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFilters();
        });
    }
    
    // Search input
    const searchInput = document.getElementById('search-orders');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchQuery = e.target.value;
                currentPage = 1;
                applyFilters();
            }, 300);
        });
    }
    
    // Close modal on overlay click
    const overlay = document.getElementById('order-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeOrderModal);
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOrderModal();
    });
}

// Export functions for global access
window.changePage = changePage;
window.closeOrderModal = closeOrderModal;
window.reorder = reorder;