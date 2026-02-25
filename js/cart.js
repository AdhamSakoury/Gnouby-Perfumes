// Cart functionality
const CART_KEY = 'gnouby_cart';
const PROMO_KEY = 'gnouby_promo'; // Store applied promo

function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Get saved promo from localStorage
function getSavedPromo() {
    const promo = localStorage.getItem(PROMO_KEY);
    return promo ? JSON.parse(promo) : null;
}

// Save promo to localStorage
function savePromo(promoData) {
    if (promoData) {
        localStorage.setItem(PROMO_KEY, JSON.stringify(promoData));
    } else {
        localStorage.removeItem(PROMO_KEY);
    }
}

// Clear promo (call after order placed)
function clearPromo() {
    localStorage.removeItem(PROMO_KEY);
}

function addToCart(perfumeId, quantity = 1) {
    if (!getCurrentUser()) {
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
        return false;
    }
    
    const cart = getCart();
    const existingItem = cart.find(item => item.perfumeId === perfumeId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ perfumeId, quantity });
    }
    
    saveCart(cart);
    updateCartCount();
    showToast('Added to cart!', 'success');
    return true;
}

function removeFromCart(perfumeId) {
    let cart = getCart();
    cart = cart.filter(item => item.perfumeId !== perfumeId);
    saveCart(cart);
    updateCartCount();
    
    if (document.getElementById('cart-items')) {
        displayCart();
    }
}

function updateQuantity(perfumeId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.perfumeId === perfumeId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(perfumeId);
        } else {
            item.quantity = quantity;
            saveCart(cart);
        }
    }
    updateCartCount();
    
    if (document.getElementById('cart-items')) {
        displayCart();
    }
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    
    if (document.getElementById('cart-items')) {
        displayCart();
    }
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const perfume = perfumes.find(p => p.id === item.perfumeId);
        return total + (perfume ? perfume.price * item.quantity : 0);
    }, 0);
}

function getCartItemCount() {
    return getCart().reduce((count, item) => count + item.quantity, 0);
}

function updateCartCount() {
    const count = getCartItemCount();
    const badges = document.querySelectorAll('#cart-count');
    badges.forEach(badge => {
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    const loginRequired = document.getElementById('login-required');
    
    if (!getCurrentUser()) {
        if (loginRequired) loginRequired.classList.remove('hidden');
        if (emptyCart) emptyCart.classList.add('hidden');
        if (cartContent) cartContent.classList.add('hidden');
        return;
    }
    
    if (loginRequired) loginRequired.classList.add('hidden');
    
    const cart = getCart();
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.classList.remove('hidden');
        if (cartContent) cartContent.classList.add('hidden');
        return;
    }
    
    if (emptyCart) emptyCart.classList.add('hidden');
    if (cartContent) cartContent.classList.remove('hidden');
    
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = cart.map(item => {
        const perfume = perfumes.find(p => p.id === item.perfumeId);
        if (!perfume) return '';
        
        return `
            <div class="bg-white dark:bg-nubian-earth rounded-2xl shadow-lg p-6 border border-nubian-gold/20 flex gap-4">
                <img src="${perfume.image}" alt="${perfume.name}" class="w-24 h-24 object-cover rounded-lg" onerror="this.src='https://via.placeholder.com/100x100/1B4D4D/FFFFFF?text=Perfume'">
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="text-sm text-nubian-gold font-semibold">${perfume.brand}</p>
                            <h3 class="text-lg font-bold text-nubian-dark dark:text-nubian-sand font-cinzel">${perfume.name}</h3>
                        </div>
                        <button onclick="removeFromCart(${perfume.id})" class="text-nubian-terracotta hover:text-red-700 transition-colors">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                        <div class="flex items-center gap-2">
                            <button onclick="updateQuantity(${perfume.id}, ${item.quantity - 1})" class="w-8 h-8 rounded-full bg-nubian-sand dark:bg-nubian-dark text-nubian-brown dark:text-nubian-gold hover:bg-nubian-gold transition-colors">
                                <i class="fas fa-minus text-xs"></i>
                            </button>
                            <span class="w-12 text-center font-semibold">${item.quantity}</span>
                            <button onclick="updateQuantity(${perfume.id}, ${item.quantity + 1})" class="w-8 h-8 rounded-full bg-nubian-sand dark:bg-nubian-dark text-nubian-brown dark:text-nubian-gold hover:bg-nubian-gold transition-colors">
                                <i class="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                        <span class="text-xl font-bold text-nubian-brown dark:text-nubian-gold">$${(perfume.price * item.quantity).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    updateCartSummary();
}

function updateCartSummary() {
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const discountRow = document.getElementById('discount-row');
    const discountAmount = document.getElementById('discount-amount');
    
    if (!subtotalEl || !totalEl) return;
    
    const subtotal = getCartTotal();
    const savedPromo = getSavedPromo();
    let discount = 0;
    
    if (savedPromo) {
        discount = subtotal * savedPromo.discount;
        if (discountRow) discountRow.classList.remove('hidden');
        if (discountAmount) discountAmount.textContent = '-$' + discount.toFixed(2);
        
        // Show applied promo UI
        const promoInputSection = document.getElementById('promo-input-section');
        const promoAppliedSection = document.getElementById('promo-applied-section');
        const promoCodeDisplay = document.getElementById('promo-code-display');
        
        if (promoInputSection) promoInputSection.classList.add('hidden');
        if (promoAppliedSection) promoAppliedSection.classList.remove('hidden');
        if (promoCodeDisplay) promoCodeDisplay.textContent = savedPromo.code;
    } else {
        if (discountRow) discountRow.classList.add('hidden');
    }
    
    const total = subtotal - discount;
    
    subtotalEl.textContent = '$' + subtotal.toFixed(2);
    totalEl.textContent = '$' + total.toFixed(2);
}

function applyCartPromoCode(code) {
    const upperCode = code.toUpperCase().trim();
    const messageEl = document.getElementById('promo-message');
    
    if (!upperCode) {
        if (messageEl) {
            messageEl.textContent = 'Please enter a promo code';
            messageEl.className = 'text-sm mt-2 text-nubian-terracotta';
        }
        return { valid: false };
    }
    
    if (typeof promoCodes === 'undefined') {
        console.error('promoCodes not loaded');
        return { valid: false };
    }
    
    if (promoCodes.hasOwnProperty(upperCode)) {
        const promoData = {
            code: upperCode,
            discount: promoCodes[upperCode]
        };
        
        savePromo(promoData); // Save to localStorage
        
        if (messageEl) {
            const percent = Math.round(promoCodes[upperCode] * 100);
            messageEl.textContent = `${upperCode} applied! ${percent}% off`;
            messageEl.className = 'text-sm mt-2 text-green-600';
        }
        
        updateCartSummary();
        return { valid: true, ...promoData };
    } else {
        clearPromo(); // Remove any existing promo
        
        if (messageEl) {
            messageEl.textContent = 'Invalid promo code. Try NUBIAN10, WELCOME15';
            messageEl.className = 'text-sm mt-2 text-nubian-terracotta';
        }
        
        updateCartSummary();
        return { valid: false };
    }
}

function removeCartPromo() {
    clearPromo();
    updateCartSummary();
    
    // Reset UI
    const promoInputSection = document.getElementById('promo-input-section');
    const promoAppliedSection = document.getElementById('promo-applied-section');
    const promoInput = document.getElementById('promo-code');
    
    if (promoInputSection) promoInputSection.classList.remove('hidden');
    if (promoAppliedSection) promoAppliedSection.classList.add('hidden');
    if (promoInput) {
        promoInput.value = '';
        promoInput.disabled = false;
    }
    
    const messageEl = document.getElementById('promo-message');
    if (messageEl) {
        messageEl.textContent = 'Promo code removed';
        messageEl.className = 'text-sm mt-2 text-nubian-earth';
        setTimeout(() => {
            messageEl.textContent = '';
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('cart-items')) {
        updateAuthUI();
        updateCartCount();
        displayCart();
        
        const applyPromoBtn = document.getElementById('apply-promo');
        const promoInput = document.getElementById('promo-code');
        const removePromoBtn = document.getElementById('remove-promo');
        
        if (applyPromoBtn && promoInput) {
            applyPromoBtn.addEventListener('click', function() {
                applyCartPromoCode(promoInput.value);
            });
            
            promoInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    applyCartPromoCode(promoInput.value);
                }
            });
        }
        
        if (removePromoBtn) {
            removePromoBtn.addEventListener('click', removeCartPromo);
        }
    }
});

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