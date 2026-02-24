// Perfumes page functionality for Gnouby Perfumes

let currentFilters = {
    gender: [],
    rating: 0,
    brands: [],
    priceMin: 0,
    priceMax: 1000
};

let currentSort = 'default';
let sidebarCollapsed = false;

// Price slider variables
let priceSlider = {
    min: 0,
    max: 1000,
    currentMin: 0,
    currentMax: 1000,
    isDragging: false,
    activeThumb: null
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize data if not present
    if (typeof perfumes === 'undefined') {
        console.warn('Perfumes data not loaded, using empty array');
        window.perfumes = [];
    }

    // Calculate actual min/max prices from data
    calculatePriceRange();

    // Initialize UI
    if (typeof updateAuthUI === 'function') updateAuthUI();
    if (typeof updateCartCount === 'function') updateCartCount();

    initFilters();
    initSidebar();
    initPriceSlider();
    initUserDropdown();
    displayPerfumes();
});

function calculatePriceRange() {
    if (typeof perfumes !== 'undefined' && perfumes.length > 0) {
        const prices = perfumes.map(p => p.price);
        priceSlider.min = Math.floor(Math.min(...prices));
        priceSlider.max = Math.ceil(Math.max(...prices));
        priceSlider.currentMin = priceSlider.min;
        priceSlider.currentMax = priceSlider.max;

        currentFilters.priceMin = priceSlider.min;
        currentFilters.priceMax = priceSlider.max;
    }
}

function initUserDropdown() {
    const userDropdownBtn = document.getElementById('user-dropdown-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (userDropdownBtn && userDropdown) {
        userDropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userDropdownBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
}

function initPriceSlider() {
    const track = document.getElementById('price-track');
    const rangeBar = document.getElementById('price-range-bar');
    const thumbMin = document.getElementById('thumb-min');
    const thumbMax = document.getElementById('thumb-max');
    const inputMin = document.getElementById('price-min-input');
    const inputMax = document.getElementById('price-max-input');

    if (!track || !thumbMin || !thumbMax) return;

    // Set initial values
    inputMin.value = priceSlider.currentMin;
    inputMax.value = priceSlider.currentMax;
    inputMin.min = priceSlider.min;
    inputMin.max = priceSlider.max;
    inputMax.min = priceSlider.min;
    inputMax.max = priceSlider.max;

    updateSliderVisuals();

    // Mouse events for thumbs
    thumbMin.addEventListener('mousedown', (e) => startDrag(e, 'min'));
    thumbMax.addEventListener('mousedown', (e) => startDrag(e, 'max'));

    // Touch events for mobile
    thumbMin.addEventListener('touchstart', (e) => startDrag(e, 'min'), {passive: false});
    thumbMax.addEventListener('touchstart', (e) => startDrag(e, 'max'), {passive: false});

    // Click on track to move nearest thumb
    track.addEventListener('click', (e) => {
        if (e.target === thumbMin || e.target === thumbMax) return;

        const rect = track.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const value = Math.round(priceSlider.min + percent * (priceSlider.max - priceSlider.min));

        const distToMin = Math.abs(value - priceSlider.currentMin);
        const distToMax = Math.abs(value - priceSlider.currentMax);

        if (distToMin < distToMax) {
            priceSlider.currentMin = Math.min(value, priceSlider.currentMax - 10);
        } else {
            priceSlider.currentMax = Math.max(value, priceSlider.currentMin + 10);
        }

        updateSliderVisuals();
        updatePriceFilter();
    });

    // Input change events
    inputMin.addEventListener('change', function() {
        let val = parseInt(this.value) || priceSlider.min;
        val = Math.max(priceSlider.min, Math.min(val, priceSlider.currentMax - 10));
        priceSlider.currentMin = val;
        this.value = val;
        updateSliderVisuals();
        updatePriceFilter();
    });

    inputMax.addEventListener('change', function() {
        let val = parseInt(this.value) || priceSlider.max;
        val = Math.min(priceSlider.max, Math.max(val, priceSlider.currentMin + 10));
        priceSlider.currentMax = val;
        this.value = val;
        updateSliderVisuals();
        updatePriceFilter();
    });

    // Global mouse/touch events
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', onDrag, {passive: false});
    document.addEventListener('touchend', stopDrag);
}

function startDrag(e, thumb) {
    e.preventDefault();
    e.stopPropagation();
    priceSlider.isDragging = true;
    priceSlider.activeThumb = thumb;

    const thumbEl = thumb === 'min' ? document.getElementById('thumb-min') : document.getElementById('thumb-max');
    if (thumbEl) thumbEl.classList.add('active');
}

function onDrag(e) {
    if (!priceSlider.isDragging || !priceSlider.activeThumb) return;
    e.preventDefault();

    const track = document.getElementById('price-track');
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    const value = Math.round(priceSlider.min + percent * (priceSlider.max - priceSlider.min));

    if (priceSlider.activeThumb === 'min') {
        priceSlider.currentMin = Math.min(value, priceSlider.currentMax - 10);
    } else {
        priceSlider.currentMax = Math.max(value, priceSlider.currentMin + 10);
    }

    updateSliderVisuals();
}

function stopDrag() {
    if (priceSlider.isDragging) {
        priceSlider.isDragging = false;
        priceSlider.activeThumb = null;

        const thumbMin = document.getElementById('thumb-min');
        const thumbMax = document.getElementById('thumb-max');
        if (thumbMin) thumbMin.classList.remove('active');
        if (thumbMax) thumbMax.classList.remove('active');

        updatePriceFilter();
    }
}

function updateSliderVisuals() {
    const rangeBar = document.getElementById('price-range-bar');
    const thumbMin = document.getElementById('thumb-min');
    const thumbMax = document.getElementById('thumb-max');
    const inputMin = document.getElementById('price-min-input');
    const inputMax = document.getElementById('price-max-input');

    if (!rangeBar || !thumbMin || !thumbMax) return;

    const range = priceSlider.max - priceSlider.min;
    const minPercent = ((priceSlider.currentMin - priceSlider.min) / range) * 100;
    const maxPercent = ((priceSlider.currentMax - priceSlider.min) / range) * 100;

    rangeBar.style.left = minPercent + '%';
    rangeBar.style.width = (maxPercent - minPercent) + '%';

    thumbMin.style.left = minPercent + '%';
    thumbMax.style.left = maxPercent + '%';

    thumbMin.setAttribute('data-value', priceSlider.currentMin);
    thumbMax.setAttribute('data-value', priceSlider.currentMax);

    if (inputMin) inputMin.value = priceSlider.currentMin;
    if (inputMax) inputMax.value = priceSlider.currentMax;
}

function updatePriceFilter() {
    currentFilters.priceMin = priceSlider.currentMin;
    currentFilters.priceMax = priceSlider.currentMax;
    updateActiveFiltersCount();
    displayPerfumes();
}

function initFilters() {
    const brandContainer = document.getElementById('brand-filters');
    if (brandContainer) {
        const brands = getUniqueBrands();
        if (brands.length > 0) {
            brandContainer.innerHTML = brands.map(brand => `
                <label class="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" class="custom-checkbox filter-brand" value="${brand}">
                    <span class="text-nubian-earth dark:text-nubian-sand group-hover:text-nubian-gold transition-colors text-sm">${brand}</span>
                </label>
            `).join('');
        }
    }

    document.querySelectorAll('.filter-gender').forEach(cb => {
        cb.addEventListener('change', updateFilters);
    });

    document.querySelectorAll('.filter-rating').forEach(rb => {
        rb.addEventListener('change', updateFilters);
    });

    const brandFilters = document.getElementById('brand-filters');
    if (brandFilters) {
        brandFilters.addEventListener('change', updateFilters);
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            displayPerfumes();
        });
    }

    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

function initSidebar() {
    const sidebar = document.getElementById('filter-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const mobileToggleBtn = document.getElementById('filter-toggle-btn-mobile');
    const closeMobileBtn = document.getElementById('close-sidebar-mobile');
    const overlay = document.getElementById('sidebar-overlay');

    if (!sidebar) return;

    // Desktop toggle
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            sidebarCollapsed = !sidebarCollapsed;
            if (sidebarCollapsed) {
                sidebar.classList.remove('expanded');
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
                sidebar.classList.add('expanded');
            }
        });
    }

    // Mobile toggle
    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', function() {
            sidebar.classList.add('mobile-open');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close mobile
    function closeMobile() {
        sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeMobileBtn) {
        closeMobileBtn.addEventListener('click', closeMobile);
    }

    if (overlay) {
        overlay.addEventListener('click', closeMobile);
    }

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobile();
        }
    });

    // Handle resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function getUniqueBrands() {
    if (typeof perfumes === 'undefined' || !Array.isArray(perfumes)) return [];
    return [...new Set(perfumes.map(p => p.brand))].sort();
}

function updateFilters() {
    currentFilters.gender = Array.from(document.querySelectorAll('.filter-gender:checked')).map(cb => cb.value);
    currentFilters.brands = Array.from(document.querySelectorAll('.filter-brand:checked')).map(cb => cb.value);

    const selectedRating = document.querySelector('.filter-rating:checked');
    currentFilters.rating = selectedRating ? parseFloat(selectedRating.value) : 0;

    updateActiveFiltersCount();
    displayPerfumes();
}

function updateActiveFiltersCount() {
    let count = currentFilters.gender.length + currentFilters.brands.length;
    if (currentFilters.rating > 0) count++;
    if (priceSlider.currentMin > priceSlider.min || priceSlider.currentMax < priceSlider.max) count++;

    const badges = document.querySelectorAll('#active-filters-count-mobile');
    badges.forEach(badge => {
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

function resetFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

    const anyRating = document.querySelector('.filter-rating[value="0"]');
    if (anyRating) anyRating.checked = true;

    priceSlider.currentMin = priceSlider.min;
    priceSlider.currentMax = priceSlider.max;
    updateSliderVisuals();

    currentFilters = {
        gender: [],
        rating: 0,
        brands: [],
        priceMin: priceSlider.min,
        priceMax: priceSlider.max
    };

    updateActiveFiltersCount();
    displayPerfumes();
}

function filterPerfumes(perfumeList) {
    return perfumeList.filter(perfume => {
        if (currentFilters.gender.length > 0) {
            if (!currentFilters.gender.includes(perfume.gender)) return false;
        }

        if (currentFilters.rating > 0) {
            if (perfume.rating < currentFilters.rating) return false;
        }

        if (currentFilters.brands.length > 0) {
            if (!currentFilters.brands.includes(perfume.brand)) return false;
        }

        if (perfume.price < currentFilters.priceMin || perfume.price > currentFilters.priceMax) {
            return false;
        }

        return true;
    });
}

function sortPerfumes(perfumeList) {
    const sorted = [...perfumeList];

    switch (currentSort) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            break;
    }

    return sorted;
}

function displayPerfumes() {
    const container = document.getElementById('perfumes-grid');
    const noResults = document.getElementById('no-results');
    const showingCount = document.getElementById('showing-count');

    if (!container) return;

    if (typeof perfumes === 'undefined' || !Array.isArray(perfumes)) {
        container.innerHTML = '<p class="text-center col-span-full">Loading...</p>';
        return;
    }

    let filtered = filterPerfumes(perfumes);
    filtered = sortPerfumes(filtered);

    if (showingCount) {
        showingCount.textContent = filtered.length;
    }

    if (filtered.length === 0) {
        container.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
        return;
    }

    if (noResults) noResults.classList.add('hidden');

    container.innerHTML = filtered.map(perfume => `
        <div class="bg-white dark:bg-nubian-earth rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="relative overflow-hidden">
                <img src="${perfume.image || 'https://via.placeholder.com/400x400/1B4D4D/FFFFFF?text=' + encodeURIComponent(perfume.name)}" 
                     alt="${perfume.name}" 
                     class="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500" 
                     onerror="this.src='https://via.placeholder.com/400x400/1B4D4D/FFFFFF?text=Perfume'">
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

    // Add event listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            if (typeof addToCart === 'function' && addToCart(id)) {
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
            if (typeof addToWishlist === 'function' && addToWishlist(id)) {
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

// Placeholder functions for when external scripts aren't loaded
if (typeof updateAuthUI !== 'function') window.updateAuthUI = function() {};
if (typeof updateCartCount !== 'function') window.updateCartCount = function() {};
if (typeof addToCart !== 'function') window.addToCart = function(id) { return true; };
if (typeof addToWishlist !== 'function') window.addToWishlist = function(id) { return true; };
if (typeof logout !== 'function') window.logout = function() { 
    localStorage.removeItem('gnouby_auth');
    localStorage.removeItem('gnouby_users');
    sessionStorage.removeItem('gnouby_auth');
    window.location.href = 'index.html';
};