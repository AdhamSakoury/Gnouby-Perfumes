// Checkout page functionality
let appliedPromo = null;

document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    
    if (!getCurrentUser()) {
        document.getElementById('login-required').classList.remove('hidden');
        return;
    }
    
    const cart = getCart();
    if (cart.length === 0) {
        document.getElementById('empty-cart').classList.remove('hidden');
        return;
    }
    
    document.getElementById('checkout-content').classList.remove('hidden');
    
    loadCheckoutSummary();
    initCheckoutForm();
});

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
}

function updateCheckoutTotals() {
    const subtotal = getCartTotal();
    let discount = 0;
    
    if (appliedPromo) {
        discount = subtotal * appliedPromo.discount;
        document.getElementById('checkout-discount-row').classList.remove('hidden');
        document.getElementById('checkout-discount').textContent = `-$${discount.toFixed(2)}`;
    } else {
        document.getElementById('checkout-discount-row').classList.add('hidden');
    }
    
    const total = subtotal - discount;
    
    document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
}

function initCheckoutForm() {
    // Pre-fill user info
    const user = getCurrentUser();
    if (user) {
        document.getElementById('checkout-name').value = user.fullName;
        document.getElementById('checkout-email').value = user.email;
    }
    
    // Place order button
    document.getElementById('place-order-btn')?.addEventListener('click', handlePlaceOrder);
}

function handlePlaceOrder() {
    clearAllErrors();
    
    const name = document.getElementById('checkout-name').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const address = document.getElementById('checkout-address').value.trim();
    const city = document.getElementById('checkout-city').value.trim();
    const postal = document.getElementById('checkout-postal').value.trim();
    
    let isValid = true;
    
    if (!validateRequired(name)) {
        showError('name-error', 'Full name is required');
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        showError('email-error', 'Valid email is required');
        isValid = false;
    }
    
    if (!validatePhone(phone)) {
        showError('phone-error', 'Valid phone number is required');
        isValid = false;
    }
    
    if (!validateRequired(address)) {
        showError('address-error', 'Address is required');
        isValid = false;
    }
    
    if (!validateRequired(city)) {
        showError('city-error', 'City is required');
        isValid = false;
    }
    
    if (!validateRequired(postal)) {
        showError('postal-error', 'Postal code is required');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Simulate order placement
    const btn = document.getElementById('place-order-btn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
    btn.disabled = true;
    
    setTimeout(() => {
        clearCart();
        alert('Order placed successfully! Thank you for shopping with Gnouby Perfumes.');
        window.location.href = 'index.html';
    }, 2000);
}