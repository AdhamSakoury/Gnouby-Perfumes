// Main page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (typeof perfumes === 'undefined') {
        console.error('Perfumes data not loaded!');
        return;
    }
    
    updateAuthUI();
    updateCartCount();
    loadFeaturedPerfumes();
    initNewsletter();
});

function loadFeaturedPerfumes() {
    const container = document.getElementById('featured-perfumes');
    if (!container) {
        console.error('Featured perfumes container not found!');
        return;
    }
    
    // Get first 6 perfumes as featured (showcasing variety)
    const featured = perfumes.slice(0, 6);
    
    if (featured.length === 0) {
        container.innerHTML = '<p class="text-center text-nubian-earth dark:text-nubian-sand col-span-3">No perfumes available</p>';
        return;
    }
    
    container.innerHTML = featured.map(perfume => `
        <div class="bg-white dark:bg-nubian-earth rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="relative overflow-hidden">
                <img src="${perfume.image}" alt="${perfume.name}" class="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://via.placeholder.com/400x400/1B4D4D/FFFFFF?text=Gnouby+Perfume'">
                <div class="absolute top-4 right-4">
                    <span class="px-3 py-1 bg-nubian-gold text-nubian-dark text-sm font-bold rounded-full">${perfume.gender}</span>
                </div>
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                    <a href="perfume-details.html?id=${perfume.id}" class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-nubian-brown hover:bg-nubian-gold transition-colors">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="add-to-wishlist-btn w-12 h-12 bg-white rounded-full flex items-center justify-center text-nubian-terracotta hover:bg-nubian-terracotta hover:text-white transition-colors" data-id="${perfume.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
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
                    <button class="add-to-cart-btn px-4 py-2 bg-nubian-brown text-white rounded-lg hover:bg-nubian-gold hover:text-nubian-dark transition-all" data-id="${perfume.id}">
                        <i class="fas fa-cart-plus mr-1"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            if (addToCart(id)) {
                this.innerHTML = '<i class="fas fa-check mr-1"></i> Added';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-cart-plus mr-1"></i> Add';
                }, 2000);
            }
        });
    });
    
    document.querySelectorAll('.add-to-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            if (addToWishlist(id)) {
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-heart"></i>';
                }, 2000);
            }
        });
    });
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

function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('newsletter-email').value;
            alert('Thank you for subscribing with: ' + email);
            this.reset();
        });
    }
}