// Dummy data for the MVP - You can expand this later
const imagesData = [
    {
        id: 1,
        url: 'https://images.unsplash.com/photo-1682695794816-7b9da18ed470?auto=format&fit=crop&q=80&w=800',
        title: 'Neon Cyberpunk City',
        category: 'cinematic',
        seed: '--v 6.0 --style raw --s 250 --seed 84920193'
    },
    {
        id: 2,
        url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800',
        title: 'Anime Girl in Rain',
        category: 'anime',
        seed: '--niji 6 --style expressive --seed 12399482'
    },
    {
        id: 3,
        url: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=800',
        title: 'Fantasy Castles',
        category: 'fantasy',
        seed: '--v 6.0 --ar 16:9 --seed 99882211'
    },
    {
        id: 4,
        url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800',
        title: 'Macro Photography Eye',
        category: 'photography',
        seed: '--v 6.0 --style raw --s 750 --seed 55566677'
    },
    {
        id: 5,
        url: 'https://images.unsplash.com/photo-1682687982501-1e58f813fb31?auto=format&fit=crop&q=80&w=800',
        title: 'Sci-Fi Desert',
        category: 'cinematic',
        seed: '--v 6.0 --ar 2:1 --seed 44433322'
    },
    {
        id: 6,
        url: 'https://images.unsplash.com/photo-1580477667995-2b71480c08ad?auto=format&fit=crop&q=80&w=800',
        title: 'Ethereal Forest',
        category: 'fantasy',
        seed: '--v 6.0 --weird 500 --seed 11223344'
    }
];

const galleryContainer = document.getElementById('gallery');
const filterBtns = document.querySelectorAll('.filter-btn');
const toast = document.getElementById('toast');
let toastTimeout;

// Function to render images based on active filter
function renderGallery(filter = 'all') {
    galleryContainer.innerHTML = ''; // Clear current
    
    const filteredData = filter === 'all' 
        ? imagesData 
        : imagesData.filter(item => item.category === filter);

    filteredData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.url}" alt="${item.title}" loading="lazy">
            <div class="card-overlay">
                <h3 class="card-title">${item.title}</h3>
                <span class="card-category">${item.category}</span>
                <button class="copy-btn" data-seed="${item.seed}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy Seed
                </button>
            </div>
        `;
        galleryContainer.appendChild(card);
    });

    // Add event listeners to new copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Prevent event from bubbling up if card has a click event later
            e.stopPropagation(); 
            const seed = btn.getAttribute('data-seed');
            copyToClipboard(seed);
        });
    });
}

// Filter logic
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add to clicked
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        renderGallery(filterValue);
    });
});

// Copy to clipboard function
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast();
    } catch (err) {
        console.error('Failed to copy text: ', err);
        // Fallback for older browsers if needed could go here
    }
}

// Show Toast notification
function showToast() {
    // Clear existing timeout if spamming click
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toast.classList.remove('show');
        // Small delay to allow CSS transition to reset before showing again
        setTimeout(() => {
            toast.classList.add('show');
            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }, 50);
        return;
    }

    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        toastTimeout = null;
    }, 2000);
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderGallery('all');
});
