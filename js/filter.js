// Filter and sort functionality
let currentFilters = {
    price: [],
    gender: [],
    rating: [],
    brands: []
};

let currentSort = 'default';

function filterPerfumes(perfumeList) {
    return perfumeList.filter(perfume => {
        // Price filter
        if (currentFilters.price.length > 0) {
            const priceMatch = currentFilters.price.some(range => {
                if (range === '0-50') return perfume.price < 50;
                if (range === '50-100') return perfume.price >= 50 && perfume.price < 100;
                if (range === '100-200') return perfume.price >= 100 && perfume.price < 200;
                if (range === '200+') return perfume.price >= 200;
                return false;
            });
            if (!priceMatch) return false;
        }
        
        // Gender filter
        if (currentFilters.gender.length > 0) {
            if (!currentFilters.gender.includes(perfume.gender)) return false;
        }
        
        // Rating filter
        if (currentFilters.rating.length > 0) {
            const minRating = Math.min(...currentFilters.rating.map(r => parseFloat(r)));
            if (perfume.rating < minRating) return false;
        }
        
        // Brand filter
        if (currentFilters.brands.length > 0) {
            if (!currentFilters.brands.includes(perfume.brand)) return false;
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

function getUniqueBrands() {
    return [...new Set(perfumes.map(p => p.brand))].sort();
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