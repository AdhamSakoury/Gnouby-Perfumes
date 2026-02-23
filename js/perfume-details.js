// Perfume details page functionality
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    updateCartCount();
    loadPerfumeDetails();
});

function loadPerfumeDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const perfumeId = parseInt(urlParams.get('id'));
    
    const perfume = perfumes.find(p => p.id === perfumeId);
    
    if (!perfume) {
        document.getElementById('perfume-not-found').classList.remove('hidden');
        return;
    }
    
    document.getElementById('perfume-details').classList.remove('hidden');
    
    // Fill in details
    document.getElementById('perfume-image').src = perfume.image;
    document.getElementById('perfume-image').alt = perfume.name;
    document.getElementById('perfume-brand').textContent = perfume.brand;
    document.getElementById('perfume-name').textContent = perfume.name;
    document.getElementById('perfume-stars').innerHTML = generateStars(perfume.rating);
    document.getElementById('perfume-rating').textContent = `${perfume.rating} out of 5`;
    document.getElementById('perfume-price').textContent = `$${perfume.price.toFixed(2)}`;
    document.getElementById('perfume-description').textContent = perfume.description;
    document.getElementById('perfume-gender').textContent = perfume.gender;
    
    // Show login prompt if not logged in
    const loginPrompt = document.getElementById('login-prompt');
    if (loginPrompt && !getCurrentUser()) {
        loginPrompt.classList.remove('hidden');
    }
    
    // Add to cart button
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            if (addToCart(perfume.id)) {
                this.innerHTML = '<i class="fas fa-check mr-2"></i> Added to Cart';
                this.classList.remove('bg-nubian-brown');
                this.classList.add('bg-green-600');
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-shopping-cart mr-2"></i> Add to Cart';
                    this.classList.remove('bg-green-600');
                    this.classList.add('bg-nubian-brown');
                }, 2000);
            }
        });
    }
    
    // Add to wishlist button
    const addToWishlistBtn = document.getElementById('add-to-wishlist-btn');
    if (addToWishlistBtn) {
        addToWishlistBtn.addEventListener('click', function() {
            if (addToWishlist(perfume.id)) {
                this.innerHTML = '<i class="fas fa-check mr-2"></i> Added to Wishlist';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-heart mr-2"></i> Add to Wishlist';
                }, 2000);
            }
        });
    }
    
    // Load related perfumes
    loadRelatedPerfumes(perfume);
}

function loadRelatedPerfumes(currentPerfume) {
    const related = perfumes
        .filter(p => p.id !== currentPerfume.id && (p.gender === currentPerfume.gender || p.brand === currentPerfume.brand))
        .slice(0, 3);
    
    const container = document.getElementById('related-perfumes');
    if (container) {
        container.innerHTML = related.map(perfume => `
            <a href="perfume-details.html?id=${perfume.id}" class="bg-white dark:bg-nubian-earth rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 block">
                <img src="${perfume.image}" alt="${perfume.name}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <p class="text-sm text-nubian-gold font-semibold">${perfume.brand}</p>
                    <h4 class="font-bold text-nubian-dark dark:text-nubian-sand font-cinzel">${perfume.name}</h4>
                    <p class="text-nubian-brown dark:text-nubian-gold font-bold">$${perfume.price.toFixed(2)}</p>
                </div>
            </a>
        `).join('');
    }
}