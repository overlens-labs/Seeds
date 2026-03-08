const imagesData = [

    // --- ILUSTRAÇÃO ---
    {
        id: 1,
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        title: 'Ilustração Digital Surreal',
        category: 'ilustracao',
        seed: 'digital illustration, surreal dreamscape, vibrant colors, intricate details --ar 2:3 --stylize 750 --v 6.1 --seed 33291847'
    },
    {
        id: 2,
        url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800',
        title: 'Character Design Fantasia',
        category: 'ilustracao',
        seed: 'fantasy character design, concept art, soft lighting, detailed linework --ar 3:4 --stylize 600 --v 6.1 --seed 48271935'
    },
    {
        id: 3,
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
        title: 'Arte Abstrata Colorida',
        category: 'ilustracao',
        seed: 'abstract digital art, fluid shapes, neon palette, generative patterns --ar 1:1 --stylize 1000 --chaos 20 --v 6.1 --seed 91023847'
    },

    // --- PINTURA ---
    {
        id: 4,
        url: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800',
        title: 'Óleo Impressionista',
        category: 'pintura',
        seed: 'oil painting, impressionist style, thick brushstrokes, natural light, landscape --ar 3:2 --stylize 500 --v 6.0 --seed 77281934'
    },
    {
        id: 5,
        url: 'https://images.unsplash.com/photo-1471897488648-5eae4ac6686b?auto=format&fit=crop&q=80&w=800',
        title: 'Aquarela Floral',
        category: 'pintura',
        seed: 'watercolor painting, delicate flowers, soft washes, paper texture, botanical --ar 2:3 --stylize 400 --v 6.0 --seed 62837401'
    },
    {
        id: 6,
        url: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&q=80&w=800',
        title: 'Óleo Clássico',
        category: 'pintura',
        seed: 'classical oil painting, renaissance style, dramatic chiaroscuro, portrait --ar 3:4 --stylize 300 --v 6.0 --seed 55190283'
    },

    // --- CINEMATOGRÁFICO ---
    {
        id: 7,
        url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
        title: 'Cena Noir Urbana',
        category: 'cinematografico',
        seed: 'cinematic noir, urban street, rain reflection, anamorphic lens flare, moody --ar 2.39:1 --style raw --v 6.1 --seed 84920193'
    },
    {
        id: 8,
        url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
        title: 'Golden Hour Cinemático',
        category: 'cinematografico',
        seed: 'cinematic golden hour, shallow depth of field, 35mm film, warm tones, epic --ar 16:9 --style raw --s 250 --v 6.1 --seed 19283746'
    },
    {
        id: 9,
        url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=800',
        title: 'Drama Sci-Fi',
        category: 'cinematografico',
        seed: 'cinematic sci-fi scene, volumetric light, fog, epic scale, IMAX quality --ar 2.39:1 --chaos 10 --stylize 800 --v 6.1 --seed 73829104'
    },

    // --- FOTOGRAFIA 3D ---
    {
        id: 10,
        url: 'https://images.unsplash.com/photo-1616499370260-485b3e5ed653?auto=format&fit=crop&q=80&w=800',
        title: 'Render 3D Minimalista',
        category: 'fotografia-3d',
        seed: '3D render, octane render, minimalist product shot, studio lighting, soft shadows --ar 1:1 --stylize 250 --v 6.0 --seed 55123489'
    },
    {
        id: 11,
        url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
        title: 'Escultura Digital',
        category: 'fotografia-3d',
        seed: 'digital sculpture, Zbrush style, hyper-realistic render, caustic lighting --ar 3:4 --stylize 500 --v 6.0 --seed 38201947'
    },
    {
        id: 12,
        url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=800',
        title: 'Arquitetura Futurista',
        category: 'fotografia-3d',
        seed: 'architectural 3D visualization, futuristic building, unreal engine 5, photorealistic --ar 16:9 --stylize 400 --v 6.0 --seed 90127364'
    },

    // --- FOTOGRAFIA ABSTRATA ---
    {
        id: 13,
        url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800',
        title: 'Macro Abstrato',
        category: 'fotografia-abstrata',
        seed: 'abstract macro photography, extreme close-up, bokeh, vibrant colors, organic forms --ar 1:1 --chaos 30 --stylize 1000 --v 6.1 --seed 91827364'
    },
    {
        id: 14,
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
        title: 'Formas Geométricas',
        category: 'fotografia-abstrata',
        seed: 'abstract geometric shapes, neon lights, long exposure, symmetry, dark background --ar 1:1 --chaos 15 --stylize 900 --v 6.1 --seed 20938471'
    },

    // --- FOTOGRAFIA RÊTRO ---
    {
        id: 15,
        url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800',
        title: 'Kodak 35mm Street',
        category: 'fotografia-retro',
        seed: 'analog film photography, Kodak Portra 400, street scene, grain, warm tones, 1980s --ar 3:2 --style raw --v 6.0 --seed 12837465'
    },
    {
        id: 16,
        url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800',
        title: 'Polaroid Vintage',
        category: 'fotografia-retro',
        seed: 'polaroid photo style, vintage 70s, faded colors, light leak, nostalgic mood --ar 1:1 --style raw --s 150 --v 6.0 --seed 84726510'
    },
    {
        id: 17,
        url: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c343?auto=format&fit=crop&q=80&w=800',
        title: 'Cinema Grão 16mm',
        category: 'fotografia-retro',
        seed: '16mm film, heavy grain, high contrast, black and white, 1960s documentary style --ar 3:2 --style raw --chaos 5 --v 6.0 --seed 30918247'
    },

    // --- FOTOGRAFIA ESTILIZADA ---
    {
        id: 18,
        url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800',
        title: 'Editorial Fashion',
        category: 'fotografia-estilizada',
        seed: 'editorial fashion photography, high contrast, dramatic lighting, Vogue style --ar 2:3 --stylize 500 --v 6.1 --seed 66534821'
    },
    {
        id: 19,
        url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800',
        title: 'Retrato Artístico',
        category: 'fotografia-estilizada',
        seed: 'artistic portrait, studio lighting, color gel, fine art photography, moody --ar 3:4 --stylize 600 --v 6.1 --seed 44821093'
    },
    {
        id: 20,
        url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800',
        title: 'Landscape Estilizado',
        category: 'fotografia-estilizada',
        seed: 'stylized landscape, long exposure, vibrant sky, teal and orange grade, epic --ar 16:9 --stylize 700 --v 6.1 --seed 57392018'
    }
];

// ─── LocalStorage: merge default + user seeds ────────────
const STORAGE_KEY = 'seedlibrary_custom';

function loadAllSeeds() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const custom = stored ? JSON.parse(stored) : [];
    return [...imagesData, ...custom];
}

function saveCustomSeed(seed) {
    const stored = localStorage.getItem(STORAGE_KEY);
    const custom = stored ? JSON.parse(stored) : [];
    custom.push(seed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
}

function deleteCustomSeed(id) {
    const stored = localStorage.getItem(STORAGE_KEY);
    const custom = stored ? JSON.parse(stored) : [];
    const updated = custom.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function isCustomSeed(id) {
    const stored = localStorage.getItem(STORAGE_KEY);
    const custom = stored ? JSON.parse(stored) : [];
    return custom.some(s => s.id === id);
}

// ─── DOM refs ────────────────────────────────────────────
const galleryContainer = document.getElementById('gallery');
const filterBtns       = document.querySelectorAll('.filter-btn');
const toast            = document.getElementById('toast');
const lightbox         = document.getElementById('lightbox');
const lightboxImg      = document.getElementById('lightbox-img');
const lightboxTitle    = document.getElementById('lightbox-title');
const lightboxCategory = document.getElementById('lightbox-category');
const lightboxPrompt   = document.getElementById('lightbox-prompt');
const lightboxCopyBtn  = document.getElementById('lightbox-copy-btn');
const lightboxClose    = document.getElementById('lightbox-close');
const addModal         = document.getElementById('add-modal');
const openAddBtn       = document.getElementById('open-add-modal');
const closeAddBtn      = document.getElementById('close-add-modal');
const cancelAddBtn     = document.getElementById('cancel-add-modal');
const addSeedForm      = document.getElementById('add-seed-form');
const formUrl          = document.getElementById('form-url');
const imgPreview       = document.getElementById('img-preview');

let toastTimeout;
let currentSeed = '';

// ─── Render ───────────────────────────────────────────────
let activeFilter = 'all';

function renderGallery(filter = 'all') {
    activeFilter = filter;
    galleryContainer.innerHTML = '';

    const all = loadAllSeeds();
    const data = filter === 'all'
        ? all
        : all.filter(item => item.category === filter);

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = item.id;
        card.innerHTML = `
            <img src="${item.url}" alt="${item.title}" loading="lazy">
            <div class="card-overlay">
                <h3 class="card-title">${item.title}</h3>
                <span class="card-category">${item.category.replace(/-/g, ' ')}</span>
                <button class="copy-btn" data-seed="${item.seed}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy Seed
                </button>
            </div>
        `;

        // Delete button (only for custom seeds)
        if (isCustomSeed(item.id)) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.title = 'Remover';
            delBtn.innerHTML = '✕';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteCustomSeed(item.id);
                renderGallery(activeFilter);
            });
            card.appendChild(delBtn);
        }

        // Open lightbox on image click
        card.querySelector('img').addEventListener('click', () => openLightbox(item));

        // Copy seed on button click
        card.querySelector('.copy-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard(item.seed, e.currentTarget);
        });

        galleryContainer.appendChild(card);
    });
}

// ─── Filters ──────────────────────────────────────────────
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGallery(btn.getAttribute('data-filter'));
    });
});

// ─── Lightbox ─────────────────────────────────────────────
function openLightbox(item) {
    lightboxImg.src      = item.url;
    lightboxImg.alt      = item.title;
    lightboxTitle.textContent    = item.title;
    lightboxCategory.textContent = item.category.replace(/-/g, ' ');
    lightboxPrompt.textContent   = item.seed;
    currentSeed = item.seed;
    resetCopyBtn(lightboxCopyBtn);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
}

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

lightboxCopyBtn.addEventListener('click', () => {
    copyToClipboard(currentSeed, lightboxCopyBtn, true);
});

// ─── Copy to clipboard ────────────────────────────────────
async function copyToClipboard(text, btn, isLightbox = false) {
    try {
        await navigator.clipboard.writeText(text);
        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
        `;
        if (!isLightbox) btn.style.background = 'rgba(255,255,255,0.25)';
        showToast();
        setTimeout(() => resetCopyBtn(btn, isLightbox), 2000);
    } catch (err) {
        console.error('Copy failed:', err);
    }
}

function resetCopyBtn(btn, isLightbox = false) {
    btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copy Seed
    `;
    if (!isLightbox) btn.style.background = '';
}

// ─── Toast ────────────────────────────────────────────────
function showToast(msg = 'Seed copied!') {
    toast.querySelector('.toast-message').textContent = msg;
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('show');
            toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
        }, 50);
        return;
    }
    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        toastTimeout = null;
    }, 2000);
}

// ─── Modal: Adicionar Seed ────────────────────────────────
function openModal() {
    addModal.classList.add('open');
    addModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    addModal.classList.remove('open');
    addModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    addSeedForm.reset();
    imgPreview.innerHTML = '';
}

openAddBtn.addEventListener('click', openModal);
closeAddBtn.addEventListener('click', closeModal);
cancelAddBtn.addEventListener('click', closeModal);

addModal.addEventListener('click', (e) => {
    if (e.target === addModal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeLightbox(); closeModal(); }
});

// Image URL preview
formUrl.addEventListener('input', () => {
    const url = formUrl.value.trim();
    if (url) {
        imgPreview.innerHTML = `<img src="${url}" alt="preview" onerror="this.style.display='none'">`;
    } else {
        imgPreview.innerHTML = '';
    }
});

// Form submit
addSeedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newSeed = {
        id: Date.now(),
        title:    document.getElementById('form-title').value.trim(),
        category: document.getElementById('form-category').value,
        url:      document.getElementById('form-url').value.trim(),
        seed:     document.getElementById('form-seed').value.trim(),
    };
    saveCustomSeed(newSeed);
    closeModal();
    renderGallery(newSeed.category);
    // activate the matching filter button
    filterBtns.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-filter') === newSeed.category);
    });
    showToast('Seed adicionado!');
});

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => renderGallery('all'));
