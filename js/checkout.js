// ==========================================
// CHECKOUT PAGE FUNCTIONALITY
// ==========================================

let appliedPromo = null;

document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    
    if (!getCurrentUser()) {
        document.getElementById('login-required')?.classList.remove('hidden');
        return;
    }
    
    const cart = getCart();
    if (cart.length === 0) {
        document.getElementById('empty-cart')?.classList.remove('hidden');
        return;
    }
    
    document.getElementById('checkout-content')?.classList.remove('hidden');
    
    // Load promo from cart.js localStorage
    loadPromoFromCart();
    
    loadCheckoutSummary();
    initCheckoutForm();
});

// Load promo that was applied in cart
function loadPromoFromCart() {
    // Use the function from cart.js to get saved promo
    if (typeof getSavedPromo === 'function') {
        appliedPromo = getSavedPromo();
    } else {
        // Fallback if cart.js not loaded
        const saved = localStorage.getItem('gnouby_promo');
        appliedPromo = saved ? JSON.parse(saved) : null;
    }
}

function loadCheckoutSummary() {
    const cart = getCart();
    const container = document.getElementById('checkout-items');
    
    if (!container) return;
    
    container.innerHTML = cart.map(item => {
        const perfume = perfumes.find(p => p.id === item.perfumeId);
        if (!perfume) return '';
        
        return `
            <div class="flex items-center space-x-4 py-3 border-b border-nubian-sand dark:border-nubian-dark last:border-0">
                <img src="${perfume.image}" alt="${perfume.name}" class="w-16 h-16 object-cover rounded-lg">
                <div class="flex-1">
                    <h4 class="font-bold text-nubian-dark dark:text-nubian-sand text-sm">${perfume.name}</h4>
                    <p class="text-nubian-earth dark:text-nubian-sand text-xs">Qty: ${item.quantity}</p>
                </div>
                <span class="font-bold text-nubian-brown dark:text-nubian-gold">$${(perfume.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    }).join('');
    
    updateCheckoutTotals();
    
    // Show promo section if promo is applied
    if (appliedPromo) {
        showAppliedPromoInCheckout();
    }
}

function updateCheckoutTotals() {
    const subtotal = getCartTotal();
    let discount = 0;
    
    if (appliedPromo) {
        discount = subtotal * appliedPromo.discount;
        document.getElementById('checkout-discount-row')?.classList.remove('hidden');
        document.getElementById('checkout-discount').textContent = `-$${discount.toFixed(2)}`;
        
        const percentEl = document.getElementById('promo-percent');
        if (percentEl) percentEl.textContent = `(${Math.round(appliedPromo.discount * 100)}% off)`;
    } else {
        document.getElementById('checkout-discount-row')?.classList.add('hidden');
    }
    
    const total = subtotal - discount;
    
    document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
}

// Show applied promo in checkout (read-only display)
function showAppliedPromoInCheckout() {
    const promoSection = document.getElementById('checkout-promo-section');
    const promoCodeEl = document.getElementById('checkout-promo-code');
    const promoDiscountEl = document.getElementById('checkout-promo-discount');
    
    if (promoSection) promoSection.classList.remove('hidden');
    if (promoCodeEl) promoCodeEl.textContent = appliedPromo.code;
    if (promoDiscountEl) {
        const percent = Math.round(appliedPromo.discount * 100);
        const subtotal = getCartTotal();
        const savings = subtotal * appliedPromo.discount;
        promoDiscountEl.textContent = `${percent}% off (save $${savings.toFixed(2)})`;
    }
}

// ==========================================
// CHECKOUT FORM & ORDER PROCESSING
// ==========================================

function initCheckoutForm() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('checkout-name').value = user.fullName || '';
        document.getElementById('checkout-email').value = user.email || '';
    }
    
    document.getElementById('place-order-btn')?.addEventListener('click', handlePlaceOrder);
}

function handlePlaceOrder() {
    clearAllErrors();
    
    const formData = {
        name: document.getElementById('checkout-name')?.value.trim(),
        email: document.getElementById('checkout-email')?.value.trim(),
        phone: document.getElementById('checkout-phone')?.value.trim(),
        address: document.getElementById('checkout-address')?.value.trim(),
        city: document.getElementById('checkout-city')?.value.trim(),
        postal: document.getElementById('checkout-postal')?.value.trim()
    };
    
    if (!validateCheckoutForm(formData)) return;
    
    processOrder(formData);
}

function validateCheckoutForm(data) {
    let isValid = true;
    
    if (!validateRequired(data.name)) {
        showError('name-error', 'Full name is required');
        isValid = false;
    }
    
    if (!validateEmail(data.email)) {
        showError('email-error', 'Valid email is required');
        isValid = false;
    }
    
    if (!validatePhone(data.phone)) {
        showError('phone-error', 'Valid phone number is required');
        isValid = false;
    }
    
    if (!validateRequired(data.address)) {
        showError('address-error', 'Address is required');
        isValid = false;
    }
    
    if (!validateRequired(data.city)) {
        showError('city-error', 'City is required');
        isValid = false;
    }
    
    if (!validateRequired(data.postal)) {
        showError('postal-error', 'Postal code is required');
        isValid = false;
    }
    
    return isValid;
}

function processOrder(shippingData) {
    const btn = document.getElementById('place-order-btn');
    
    // Set processing state
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        btn.disabled = true;
        btn.classList.add('opacity-75', 'cursor-not-allowed');
    }
    
    const cart = getCart();
    const subtotal = getCartTotal();
    const discount = appliedPromo ? subtotal * appliedPromo.discount : 0;
    const total = subtotal - discount;
    
    const orderItems = cart.map(item => {
        const perfume = perfumes.find(p => p.id === item.perfumeId);
        return {
            id: item.perfumeId,
            name: perfume?.name || 'Unknown Product',
            price: perfume?.price || 0,
            image: perfume?.image || '',
            quantity: item.quantity
        };
    });
    
    const newOrder = {
        id: 'ORD-' + Date.now().toString(36).toUpperCase(),
        date: new Date().toISOString(),
        status: 'Processing',
        items: orderItems,
        subtotal: subtotal,
        discount: discount,
        total: total,
        shippingAddress: {
            name: shippingData.name,
            street: shippingData.address,
            city: shippingData.city,
            state: '',
            zip: shippingData.postal,
            country: 'Egypt'
        },
        promoCode: appliedPromo?.code || null
    };
    
    // Save order
    const user = getCurrentUser();
    if (!user.orders) user.orders = [];
    user.orders.unshift(newOrder);
    updateCurrentUser(user);
    saveUser(user);
    
    // Simulate processing delay then complete
    setTimeout(() => {
        clearCart();
        
        // CLEAR PROMO AFTER ORDER IS PLACED
        if (typeof clearPromo === 'function') {
            clearPromo(); // Use function from cart.js
        } else {
            localStorage.removeItem('gnouby_promo'); // Fallback
        }
        
        // Show success and redirect
        if (typeof showToast === 'function') {
            showToast('Order placed successfully! Thank you for shopping with Gnouby Perfumes.', 'success');
        } else {
            alert('Order placed successfully! Thank you for shopping with Gnouby Perfumes.');
        }
        
        window.location.href = 'orders.html';
    }, 2000);
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

function validateRequired(value) {
    return value && value.trim().length > 0;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return phone.replace(/\D/g, '').length >= 10;
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
    }
}

function clearAllErrors() {
    document.querySelectorAll('[id$="-error"]').forEach(el => {
        el.classList.add('hidden');
        el.textContent = '';
    });
}

// ==========================================
// DARK MODE
// ==========================================

function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const icon = darkModeToggle?.querySelector('i');
    
    const isDark = localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        document.documentElement.classList.add('dark');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }
    
    darkModeToggle?.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isNowDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isNowDark);
        if (icon) {
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
        }
    });
}