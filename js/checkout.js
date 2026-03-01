// ==========================================
// CHECKOUT PAGE FUNCTIONALITY
// ==========================================

let appliedPromo = null;

document.addEventListener('DOMContentLoaded', function() {
    // Dark mode is handled by darkmode.js - DO NOT call initDarkMode() here
    
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
    initPaymentMethodSelection();
});

// Load promo that was applied in cart
function loadPromoFromCart() {
    if (typeof getSavedPromo === 'function') {
        appliedPromo = getSavedPromo();
    } else {
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
// PAYMENT METHOD SELECTION
// ==========================================

function initPaymentMethodSelection() {
    const radios = document.querySelectorAll('input[name="payment"]');
    
    radios.forEach(radio => {
        radio.addEventListener('change', updatePaymentBorders);
    });
    
    updatePaymentBorders();
}

function updatePaymentBorders() {
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        const label = radio.closest('label');
        if (!label) return;
        
        if (radio.checked) {
            label.classList.remove('border-nubian-sand', 'dark:border-nubian-dark');
            label.classList.add('border-nubian-gold');
        } else {
            label.classList.remove('border-nubian-gold');
            label.classList.add('border-nubian-sand', 'dark:border-nubian-dark');
        }
    });
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
    
    const user = getCurrentUser();
    if (!user.orders) user.orders = [];
    user.orders.unshift(newOrder);
    updateCurrentUser(user);
    saveUser(user);
    
    setTimeout(() => {
        clearCart();
        
        if (typeof clearPromo === 'function') {
            clearPromo();
        } else {
            localStorage.removeItem('gnouby_promo');
        }
        
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