// ─── Storage Keys ──────────────────────────────────────────
const SL_KEYS = {
    SEEDS:      'seedlibrary_custom',
    CATEGORIES: 'sl_categories',
    TAGS:       'sl_tags',
    LOGO:       'sl_logo',
    FAVS:       'sl_favorites',
    SEEN:       'sl_seen_counts',
};

// ─── Defaults ──────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
    { slug: 'ilustracao',      label: 'Ilustração' },
    { slug: 'pintura',         label: 'Pintura' },
    { slug: 'cinematografico', label: 'Cinematográfico' },
    { slug: 'fotografia',      label: 'Fotografia' },
];

const DEFAULT_TAGS = {
    'ilustracao':      ['Anime', 'Fantasia', 'Sci-Fi', 'Retrato'],
    'pintura':         ['Aquarela', 'Óleo', 'Digital', 'Acrílico'],
    'cinematografico': ['Noir', 'Sci-Fi', 'Drama', 'Terror'],
    'fotografia':      ['3D', 'Abstrata', 'Rêtro', 'Estilizada'],
};

const DEFAULT_LOGO = { title: 'Seed Library', subtitle: 'Descubra e copie prompts incríveis.' };

// ─── Legacy Seeds (default content) ───────────────────────
const DEFAULT_SEEDS = [
    // Cinematic — --chaos 20 --ar 2:3 --sref 1335406569
    { id: -1,  url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop', title: 'Cinematic', category: 'cinematografico', seed: '--chaos 20 --ar 2:3 --sref 1335406569 --profile c6so3sz --sw 500 --stylize 1000 --v 6.1' },
    { id: -2,  url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop', title: 'Cinematic', category: 'cinematografico', seed: '--chaos 20 --ar 2:3 --sref 1335406569 --profile c6so3sz --sw 500 --stylize 1000 --v 6.1' },
    { id: -3,  url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop', title: 'Cinematic', category: 'cinematografico', seed: '--chaos 20 --ar 2:3 --sref 1335406569 --profile c6so3sz --sw 500 --stylize 1000 --v 6.1' },
    { id: -4,  url: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=800&auto=format&fit=crop', title: 'Cinematic', category: 'cinematografico', seed: '--chaos 20 --ar 2:3 --sref 1335406569 --profile c6so3sz --sw 500 --stylize 1000 --v 6.1' },
    // Cinematic Raw — --ar 16:9 --style raw
    { id: -5,  url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800&auto=format&fit=crop', title: 'Cinematic Raw', category: 'cinematografico', seed: '--ar 16:9 --style raw --sref random --v 6.1' },
    { id: -6,  url: 'https://images.unsplash.com/photo-1533167649158-6d508895b680?q=80&w=800&auto=format&fit=crop', title: 'Cinematic Raw', category: 'cinematografico', seed: '--ar 16:9 --style raw --sref random --v 6.1' },
    // 3D — octane render, unreal engine 5
    { id: -7,  url: 'https://images.unsplash.com/photo-1616499370260-485b3e5ed653?q=80&w=800&auto=format&fit=crop', title: '3D Render', category: 'fotografia-3d', seed: 'octane render, unreal engine 5, --ar 1:1 --stylize 250 --v 6.0' },
    { id: -8,  url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop', title: '3D Render', category: 'fotografia-3d', seed: 'octane render, unreal engine 5, --ar 1:1 --stylize 250 --v 6.0' },
    { id: -9,  url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop', title: '3D Render', category: 'fotografia-3d', seed: 'octane render, unreal engine 5, --ar 1:1 --stylize 250 --v 6.0' },
    // Anime — studio ghibli style
    { id: -10, url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop', title: 'Anime Ghibli', category: 'ilustracao', seed: 'studio ghibli style, --ar 16:9 --niji 6 --s 400', tag: 'anime' },
    { id: -11, url: 'https://images.unsplash.com/photo-1580477651156-0275815abb23?q=80&w=800&auto=format&fit=crop', title: 'Anime Ghibli', category: 'ilustracao', seed: 'studio ghibli style, --ar 16:9 --niji 6 --s 400', tag: 'anime' },
];

// Maps fotografia tag → legacy category value (backward compat)
const FOTO_TAG_MAP = {
    '3d':        'fotografia-3d',
    'abstrata':  'fotografia-abstrata',
    'rêtro':     'fotografia-retro',
    'estilizada':'fotografia-estilizada',
};

// ─── Storage Helpers ───────────────────────────────────────
function getCategories() {
    const stored = localStorage.getItem(SL_KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
}

function getAllTags() {
    const stored = localStorage.getItem(SL_KEYS.TAGS);
    return stored ? JSON.parse(stored) : DEFAULT_TAGS;
}

function getLogo() {
    const stored = localStorage.getItem(SL_KEYS.LOGO);
    return stored ? JSON.parse(stored) : DEFAULT_LOGO;
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── Seeds cache (shuffled once, preserved across filters) ─
let _seedsCache = null;

function resetSeedsCache() { _seedsCache = null; }

function loadAllSeeds() {
    if (!_seedsCache) {
        const stored = localStorage.getItem(SL_KEYS.SEEDS);
        const custom = stored ? JSON.parse(stored) : [];
        _seedsCache = shuffle([...DEFAULT_SEEDS, ...custom]);
    }
    return _seedsCache;
}

// ─── Seen Counts (new-content badge) ──────────────────────
function getSeenCounts() {
    const stored = localStorage.getItem(SL_KEYS.SEEN);
    return stored ? JSON.parse(stored) : {};
}

function markCategoryAsSeen(slug) {
    const all   = loadAllSeeds();
    const seen  = getSeenCounts();
    seen[slug]  = countForCategory(all, slug);
    localStorage.setItem(SL_KEYS.SEEN, JSON.stringify(seen));
}

function getNewCount(all, slug) {
    const seen  = getSeenCounts();
    const current = countForCategory(all, slug);
    const prev    = seen[slug];
    if (prev === undefined) return 0; // first visit: no badge
    return Math.max(0, current - prev);
}

// ─── Favorites ─────────────────────────────────────────────
function getFavorites() {
    const stored = localStorage.getItem(SL_KEYS.FAVS);
    return stored ? JSON.parse(stored) : [];
}

function isFavorite(id) {
    return getFavorites().includes(id);
}

function toggleFavorite(id) {
    const favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx === -1) favs.push(id);
    else favs.splice(idx, 1);
    localStorage.setItem(SL_KEYS.FAVS, JSON.stringify(favs));
    return idx === -1; // true = added
}

// ─── Seed Param Parser ─────────────────────────────────────
function parseSeedParams(seed) {
    const patterns = [
        { regex: /--v\s+([\d.]+)/i,        label: 'v' },
        { regex: /--ar\s+([\d:]+)/i,        label: 'ar' },
        { regex: /--stylize\s+(\d+)/i,      label: 's' },
        { regex: /\s--s\s+(\d+)/i,          label: 's' },
        { regex: /--chaos\s+(\d+)/i,        label: 'chaos' },
        { regex: /--sref\s+(\d+)/i,         label: 'sref' },
        { regex: /--style\s+([\w-]+)/i,     label: 'style' },
        { regex: /--seed\s+(\d+)/i,         label: 'seed' },
        { regex: /--profile\s+([\w-]+)/i,   label: 'profile' },
        { regex: /--iw\s+([\d.]+)/i,        label: 'iw' },
    ];
    const seen = new Set();
    return patterns.reduce((acc, { regex, label }) => {
        if (seen.has(label)) return acc;
        const m = seed.match(regex);
        if (m) { seen.add(label); acc.push({ label, value: m[1] }); }
        return acc;
    }, []);
}

// ─── DOM refs ─────────────────────────────────────────────
const galleryContainer    = document.getElementById('gallery');
const toast               = document.getElementById('toast');
const lightbox            = document.getElementById('lightbox');
const lightboxImg         = document.getElementById('lightbox-img');
const lightboxCategory    = document.getElementById('lightbox-category');
const lightboxParams      = document.getElementById('lightbox-params');
const lightboxPrompt      = document.getElementById('lightbox-prompt');
const lightboxCopyBtn     = document.getElementById('lightbox-copy-btn');
const lightboxDownloadBtn = document.getElementById('lightbox-download-btn');
const lightboxFavBtn      = document.getElementById('lightbox-fav-btn');
const lightboxShareBtn    = document.getElementById('lightbox-share-btn');
const lightboxClose       = document.getElementById('lightbox-close');
const lightboxPrev        = document.getElementById('lightbox-prev');
const lightboxNext        = document.getElementById('lightbox-next');
const sidebarTags         = document.getElementById('sidebar-tags');

let toastTimeout;
let currentSeed    = '';
let currentItemId  = null;
let activeFilter   = 'all';
let activeTag      = null;
let currentData    = [];
let currentIndex   = 0;
let searchQuery    = '';

// ─── Filter Buttons (dynamic) ─────────────────────────────
function countForCategory(all, slug) {
    if (slug === 'all') return all.length;
    if (slug === 'favorites') return all.filter(s => isFavorite(s.id)).length;
    return all.filter(item =>
        item.category === slug || item.category.startsWith(slug + '-')
    ).length;
}

function renderFilterButtons() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = '';

    const categories = getCategories();
    const all = loadAllSeeds();
    const allItems = [
        { slug: 'all',       label: 'Todos' },
        { slug: 'favorites', label: 'Favoritos' },
        ...categories,
    ];

    allItems.forEach(({ slug, label }) => {
        const newCount = getNewCount(all, slug);
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (activeFilter === slug ? ' active' : '');
        btn.dataset.filter = slug;

        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;
        btn.appendChild(labelSpan);

        if (newCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'filter-new-badge';
            badge.textContent = '+' + newCount;
            btn.appendChild(badge);
        }

        btn.addEventListener('click', () => {
            nav.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTag = null;
            activeFilter = slug;
            markCategoryAsSeen(slug);
            if (slug !== 'all' && slug !== 'favorites') {
                renderTags(slug);
            } else {
                sidebarTags.innerHTML = '';
            }
            renderGallery(slug);
            renderFilterButtons(); // refresh badges
        });
        nav.appendChild(btn);
    });
}

// ─── Tags ─────────────────────────────────────────────────
function renderTags(category) {
    const allTags = getAllTags();
    const tags = allTags[category];
    if (!tags || tags.length === 0) { sidebarTags.innerHTML = ''; return; }

    const activeBtn = document.querySelector(`#sidebar-nav .filter-btn[data-filter="${category}"]`);
    if (activeBtn) activeBtn.insertAdjacentElement('afterend', sidebarTags);

    sidebarTags.innerHTML = tags.map(tag =>
        `<button class="tag-btn${activeTag === tag.toLowerCase() ? ' active' : ''}" data-tag="${tag.toLowerCase()}">${tag}</button>`
    ).join('');

    sidebarTags.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tag = btn.getAttribute('data-tag');
            activeTag = activeTag === tag ? null : tag;
            renderTags(category);
            renderGallery(category, activeTag);
        });
    });
}

// ─── Render Gallery ───────────────────────────────────────
function renderGallery(filter = 'all', tag = null) {
    activeFilter = filter;
    galleryContainer.innerHTML = '';

    const all = loadAllSeeds();
    const favs = getFavorites();
    let data;

    if (filter === 'favorites') {
        data = all.filter(item => favs.includes(item.id));
    } else if (filter === 'all') {
        data = all;
    } else if (filter === 'fotografia') {
        data = all.filter(item =>
            item.category === 'fotografia' || item.category.startsWith('fotografia-')
        );
        if (tag) {
            data = data.filter(item =>
                item.tag === tag || item.category === FOTO_TAG_MAP[tag]
            );
        }
    } else {
        data = all.filter(item =>
            item.category === filter || item.category.startsWith(filter + '-')
        );
        if (tag) {
            data = data.filter(item => item.tag === tag);
        }
    }

    // Apply search filter
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        data = data.filter(item => item.seed.toLowerCase().includes(q));
    }

    currentData = data;

    if (data.length === 0) {
        galleryContainer.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:#555;font-family:var(--font-title);font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;">
                ${searchQuery ? `Nenhum resultado para "<strong style="color:#777">${searchQuery}</strong>"` : 'Nenhuma seed aqui ainda.'}
            </div>`;
        return;
    }

    data.forEach(item => {
        const isFav = favs.includes(item.id);
        const card = document.createElement('div');
        card.className = 'card' + (isFav ? ' favorited' : '');
        card.dataset.id = item.id;
        card.innerHTML = `
            <span class="card-heart"><span class="material-symbols-rounded">favorite</span></span>
            <img src="${item.url}" alt="${item.title}" loading="lazy">
            <div class="card-overlay">
                <button class="copy-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy Seed
                </button>
            </div>
        `;

        card.addEventListener('click', () => openLightbox(item));
        card.querySelector('.copy-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard(item.seed, e.currentTarget);
        });

        galleryContainer.appendChild(card);
    });
}

// ─── Category Label ────────────────────────────────────────
function getCategoryLabel(slug) {
    const cats = getCategories();
    const cat = cats.find(c => slug === c.slug || slug.startsWith(c.slug + '-'));
    return cat ? cat.label : slug.replace(/-/g, ' ');
}

// ─── Lightbox ─────────────────────────────────────────────
function showLightboxItem(item) {
    lightboxImg.src              = item.url;
    lightboxImg.alt              = item.title;
    lightboxCategory.textContent = getCategoryLabel(item.category);
    lightboxPrompt.textContent   = item.seed;
    lightboxDownloadBtn.dataset.url      = item.url;
    lightboxDownloadBtn.dataset.filename = item.title || 'seed';
    currentSeed   = item.seed;
    currentItemId = item.id;
    lightbox.style.setProperty('--lb-bg', `url("${item.url.replace(/"/g, '\\"')}")`);
    resetCopyBtn(lightboxCopyBtn);

    // Param badges
    const params = parseSeedParams(item.seed);
    lightboxParams.innerHTML = params
        .map(p => `<span class="param-badge">${p.label}<b>${p.value}</b></span>`)
        .join('');

    // Fav button state
    const faved = isFavorite(item.id);
    lightboxFavBtn.classList.toggle('active', faved);
    lightboxFavBtn.querySelector('.fav-btn-text').textContent = faved ? 'Favoritado' : 'Favoritar';

    // Update URL hash
    history.replaceState(null, '', '#seed-' + item.id);
}

function openLightbox(item) {
    currentIndex = currentData.findIndex(d => d.id === item.id);
    showLightboxItem(item);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function navigateLightbox(dir) {
    currentIndex = (currentIndex + dir + currentData.length) % currentData.length;
    showLightboxItem(currentData[currentIndex]);
}

function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    history.replaceState(null, '', location.pathname);
    setTimeout(() => { lightboxImg.src = ''; }, 300);
}

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

lightboxCopyBtn.addEventListener('click', () => {
    copyToClipboard(currentSeed, lightboxCopyBtn, true);
});

lightboxDownloadBtn.addEventListener('click', async () => {
    const url      = lightboxDownloadBtn.dataset.url;
    const filename = (lightboxDownloadBtn.dataset.filename || 'seed');

    // Base64 data URL (seeds customizadas) — download direto
    if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        return;
    }

    // URL normal — fetch como blob e força download
    try {
        const res  = await fetch(url);
        const blob = await res.blob();
        const ext  = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename + '.' + ext;
        a.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
        // Fallback: canvas
        try {
            const canvas = document.createElement('canvas');
            canvas.width  = lightboxImg.naturalWidth;
            canvas.height = lightboxImg.naturalHeight;
            canvas.getContext('2d').drawImage(lightboxImg, 0, 0);
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = filename + '.png';
            a.click();
        } catch {
            window.open(url);
        }
    }
});

lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
});

// ─── Swipe mobile ──────────────────────────────────────────
let _touchX = 0, _touchY = 0;
lightbox.addEventListener('touchstart', (e) => {
    _touchX = e.touches[0].clientX;
    _touchY = e.touches[0].clientY;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - _touchX;
    const dy = e.changedTouches[0].clientY - _touchY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
        navigateLightbox(dx < 0 ? 1 : -1);
    }
}, { passive: true });

// ─── Favorite ──────────────────────────────────────────────
lightboxFavBtn.addEventListener('click', () => {
    if (currentItemId === null) return;
    const added = toggleFavorite(currentItemId);
    lightboxFavBtn.classList.toggle('active', added);
    lightboxFavBtn.querySelector('.fav-btn-text').textContent = added ? 'Favoritado' : 'Favoritar';
    // Update card heart in gallery
    const card = galleryContainer.querySelector(`.card[data-id="${currentItemId}"]`);
    if (card) card.classList.toggle('favorited', added);
    // Update sidebar counts
    renderFilterButtons();
    showToast(added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
});

// ─── Share ─────────────────────────────────────────────────
lightboxShareBtn.addEventListener('click', () => {
    const url = location.origin + location.pathname + '#seed-' + currentItemId;
    navigator.clipboard.writeText(url).then(() => showToast('Link copiado!')).catch(() => {
        prompt('Copie o link:', url);
    });
});

// ─── Gallery Search ────────────────────────────────────────
let _searchDebounce;
document.getElementById('gallery-search').addEventListener('input', (e) => {
    clearTimeout(_searchDebounce);
    _searchDebounce = setTimeout(() => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderGallery(activeFilter, activeTag);
    }, 220);
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

// ─── Sidebar Toggle ───────────────────────────────────────
(function () {
    const btn = document.getElementById('sidebar-toggle');
    if (!btn) return;
    const STORAGE_KEY = 'sl_sidebar_collapsed';

    const apply = (collapsed) => {
        document.body.classList.toggle('sidebar-collapsed', collapsed);
        btn.textContent = collapsed ? '›' : '‹';
    };

    apply(localStorage.getItem(STORAGE_KEY) === '1');

    btn.addEventListener('click', () => {
        const collapsed = !document.body.classList.contains('sidebar-collapsed');
        apply(collapsed);
        localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    });
})();

// ─── Real-time sync between tabs ──────────────────────────
window.addEventListener('storage', (e) => {
    if (e.key === SL_KEYS.LOGO) {
        const logo = JSON.parse(e.newValue || JSON.stringify(DEFAULT_LOGO));
        document.getElementById('logo-title').textContent = logo.title;
        document.getElementById('logo-subtitle').textContent = logo.subtitle;
    } else if (e.key === SL_KEYS.CATEGORIES) {
        renderFilterButtons();
        renderGallery(activeFilter, activeTag);
    } else if (e.key === SL_KEYS.SEEDS) {
        resetSeedsCache();
        renderFilterButtons();
        renderGallery(activeFilter, activeTag);
    } else if (e.key === SL_KEYS.TAGS) {
        renderGallery(activeFilter, activeTag);
    } else if (e.key === SL_KEYS.FAVS) {
        renderFilterButtons();
        renderGallery(activeFilter, activeTag);
    }
});

// ─── Hash Navigation ───────────────────────────────────────
function checkHashNavigation() {
    const hash = location.hash;
    if (!hash.startsWith('#seed-')) return;
    const rawId = hash.replace('#seed-', '');
    const numId = Number(rawId);
    const all = loadAllSeeds();
    const item = all.find(s => s.id === numId || String(s.id) === rawId);
    if (item) setTimeout(() => openLightbox(item), 80);
}

// ─── Init ─────────────────────────────────────────────────
function init() {
    const logo = getLogo();
    document.getElementById('logo-title').textContent = logo.title;
    document.getElementById('logo-subtitle').textContent = logo.subtitle;
    renderFilterButtons();
    renderGallery('all');
    checkHashNavigation();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
}

init();
