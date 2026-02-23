// Wishlist functionality
const WISHLIST_KEY = 'gnouby_wishlist';

function getWishlist() {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
}

function saveWishlist(wishlist) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

function addToWishlist(perfumeId) {
    if (!getCurrentUser()) {
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
        return false;
    }
    
    const wishlist = getWishlist();
    if (!wishlist.includes(perfumeId)) {
        wishlist.push(perfumeId);
        saveWishlist(wishlist);
        showToast('Added to wishlist!', 'success');
        updateWishlistCount();
        return true;
    }
    return false;
}

function removeFromWishlist(perfumeId) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(id => id !== perfumeId);
    saveWishlist(wishlist);
    updateWishlistCount();
    
    if (document.getElementById('wishlist-content')) {
        displayWishlist();
    }
}

function isInWishlist(perfumeId) {
    return getWishlist().includes(perfumeId);
}

function toggleWishlist(perfumeId) {
    if (isInWishlist(perfumeId)) {
        removeFromWishlist(perfumeId);
        return false;
    } else {
        addToWishlist(perfumeId);
        return true;
    }
}

function getWishlistCount() {
    return getWishlist().length;
}

function updateWishlistCount() {
    const count = getWishlistCount();
    const countElements = document.querySelectorAll('#wishlist-count');
    countElements.forEach(el => {
        if (el) el.textContent = count;
    });
}

function displayWishlist() {
    const container = document.getElementById('wishlist-content');
    const emptyWishlist = document.getElementById('empty-wishlist');
    const loginRequired = document.getElementById('login-required');
    
    if (!getCurrentUser()) {
        if (loginRequired) loginRequired.classList.remove('hidden');
        if (emptyWishlist) emptyWishlist.classList.add('hidden');
        if (container) container.classList.add('hidden');
        return;
    }
    
    if (loginRequired) loginRequired.classList.add('hidden');
    
    const wishlist = getWishlist();
    
    if (wishlist.length === 0) {
        if (emptyWishlist) emptyWishlist.classList.remove('hidden');
        if (container) {
            container.classList.add('hidden');
            container.innerHTML = '';
        }
        return;
    }
    
    if (emptyWishlist) emptyWishlist.classList.add('hidden');
    if (container) container.classList.remove('hidden');
    
    if (!container) return;
    
    container.innerHTML = wishlist.map(id => {
        const perfume = perfumes.find(p => p.id === id);
        if (!perfume) return '';
        
        return `
            <div class="bg-white dark:bg-nubian-earth rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div class="relative overflow-hidden">
                    <img src="${perfume.image}" alt="${perfume.name}" class="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://via.placeholder.com/400x400/1B4D4D/FFFFFF?text=Gnouby+Perfume'">
                    <div class="absolute top-4 right-4">
                        <span class="px-3 py-1 bg-nubian-gold text-nubian-dark text-sm font-bold rounded-full">${perfume.gender}</span>
                    </div>
                    <button onclick="removeFromWishlist(${perfume.id})" class="absolute top-4 left-4 w-10 h-10 bg-white dark:bg-nubian-dark rounded-full flex items-center justify-center text-nubian-terracotta hover:bg-nubian-terracotta hover:text-white transition-all shadow-lg">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="p-6">
                    <p class="text-sm text-nubian-gold font-semibold mb-1">${perfume.brand}</p>
                    <h3 class="text-xl font-bold text-nubian-dark dark:text-nubian-sand mb-2 font-cinzel">${perfume.name}</h3>
                    <div class="flex items-center mb-3">
                        ${generateStars(perfume.rating)}
                        <span class="ml-2 text-sm text-nubian-earth dark:text-nubian-sand">(${perfume.rating})</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-2xl font-bold text-nubian-brown dark:text-nubian-gold">$${perfume.price.toFixed(2)}</span>
                        <button onclick="addToCart(${perfume.id})" class="px-4 py-2 bg-nubian-brown text-white rounded-lg hover:bg-nubian-gold hover:text-nubian-dark transition-all">
                            <i class="fas fa-cart-plus mr-1"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star text-nubian-gold"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt text-nubian-gold"></i>';
        } else {
            stars += '<i class="far fa-star text-nubian-gold"></i>';
        }
    }
    return stars;
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('wishlist-content')) {
        updateAuthUI();
        updateCartCount();
        updateWishlistCount();
        displayWishlist();
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