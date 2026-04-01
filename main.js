// ─── Unregister old Service Worker ────────────────────────
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(r => r.unregister());
    });
    caches.keys().then(names => names.forEach(n => caches.delete(n)));
}

// ─── Local-only Keys (favorites & seen stay in browser) ───
const SL_KEYS = {
    FAVS:  'sl_favorites',
    SEEN:  'sl_seen_counts',
};

// ─── Defaults (fallback if Supabase is empty) ─────────────
const DEFAULT_CATEGORIES = [
    { slug: 'ilustracao',      label: 'Ilustração', sort_order: 0 },
    { slug: 'pintura',         label: 'Pintura',    sort_order: 1 },
    { slug: 'cinematografico', label: 'Cinematográfico', sort_order: 2 },
    { slug: 'fotografia',      label: 'Fotografia', sort_order: 3 },
];

const DEFAULT_LOGO = { title: 'Seed Library', subtitle: 'Descubra e copie prompts incríveis.' };

// Maps fotografia tag → legacy category value (backward compat)
const FOTO_TAG_MAP = {
    '3d':        'fotografia-3d',
    'abstrata':  'fotografia-abstrata',
    'rêtro':     'fotografia-retro',
    'estilizada':'fotografia-estilizada',
};

// ─── Supabase Data Helpers ────────────────────────────────
async function getCategories() {
    const { data, error } = await sb
        .from('categories')
        .select('*')
        .order('sort_order');
    if (error || !data || data.length === 0) return DEFAULT_CATEGORIES;
    return data;
}

async function getAllTags() {
    const { data, error } = await sb
        .from('tags')
        .select('*');
    if (error || !data) return {};
    // Group by category_slug → array of labels
    const map = {};
    data.forEach(t => {
        if (!map[t.category_slug]) map[t.category_slug] = [];
        map[t.category_slug].push(t.label);
    });
    return map;
}

async function getLogo() {
    const { data, error } = await sb
        .from('settings')
        .select('value')
        .eq('key', 'logo')
        .single();
    if (error || !data) return DEFAULT_LOGO;
    return data.value;
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
let _categoriesCache = null;
let _tagsCache = null;

function resetSeedsCache() { _seedsCache = null; }

async function loadAllSeeds() {
    if (!_seedsCache) {
        const { data, error } = await sb
            .from('seeds')
            .select('*');
        const seeds = (!error && data) ? data : [];
        _seedsCache = shuffle([...seeds]);
    }
    return _seedsCache;
}

async function getCategoriesCached() {
    if (!_categoriesCache) _categoriesCache = await getCategories();
    return _categoriesCache;
}

async function getTagsCached() {
    if (!_tagsCache) _tagsCache = await getAllTags();
    return _tagsCache;
}

// ─── Seen Counts (new-content badge) — local only ────────
function getSeenCounts() {
    const stored = localStorage.getItem(SL_KEYS.SEEN);
    return stored ? JSON.parse(stored) : {};
}

function markCategoryAsSeen(slug, all) {
    const seen  = getSeenCounts();
    seen[slug]  = countForCategory(all, slug);
    localStorage.setItem(SL_KEYS.SEEN, JSON.stringify(seen));
}

function getNewCount(all, slug) {
    const seen  = getSeenCounts();
    const current = countForCategory(all, slug);
    const prev    = seen[slug];
    if (prev === undefined) return 0;
    return Math.max(0, current - prev);
}

// ─── Favorites — local only ──────────────────────────────
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
    return idx === -1;
}

// ─── Seed Param Parser ────────────────────────────────────
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

// ─── DOM refs ────────────────────────────────────────────
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

// ─── Filter Buttons (dynamic) ────────────────────────────
function countForCategory(all, slug) {
    if (slug === 'all') return all.length;
    if (slug === 'favorites') return all.filter(s => isFavorite(s.id)).length;
    return all.filter(item =>
        item.category === slug || item.category.startsWith(slug + '-')
    ).length;
}

async function renderFilterButtons() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = '';

    const categories = await getCategoriesCached();
    const all = await loadAllSeeds();
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

        btn.addEventListener('click', async () => {
            nav.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTag = null;
            activeFilter = slug;
            const allSeeds = await loadAllSeeds();
            markCategoryAsSeen(slug, allSeeds);
            if (slug !== 'all' && slug !== 'favorites') {
                await renderTags(slug);
            } else {
                sidebarTags.innerHTML = '';
            }
            await renderGallery(slug);
            await renderFilterButtons();
        });
        nav.appendChild(btn);
    });
}

// ─── Tags ────────────────────────────────────────────────
async function renderTags(category) {
    const allTags = await getTagsCached();
    const tags = allTags[category];
    if (!tags || tags.length === 0) { sidebarTags.innerHTML = ''; return; }

    const activeBtn = document.querySelector(`#sidebar-nav .filter-btn[data-filter="${category}"]`);
    if (activeBtn) activeBtn.insertAdjacentElement('afterend', sidebarTags);

    sidebarTags.innerHTML = tags.map(tag =>
        `<button class="tag-btn${activeTag === tag.toLowerCase() ? ' active' : ''}" data-tag="${tag.toLowerCase()}">${tag}</button>`
    ).join('');

    sidebarTags.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const tag = btn.getAttribute('data-tag');
            activeTag = activeTag === tag ? null : tag;
            await renderTags(category);
            await renderGallery(category, activeTag);
        });
    });
}

// ─── Render Gallery ──────────────────────────────────────
async function renderGallery(filter = 'all', tag = null) {
    activeFilter = filter;
    galleryContainer.innerHTML = '';

    const all = await loadAllSeeds();
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
            <img src="${item.url}" alt="${item.title || ''}" loading="lazy">
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
        card.querySelector('.card-heart').addEventListener('click', async (e) => {
            e.stopPropagation();
            const added = toggleFavorite(item.id);
            card.classList.toggle('favorited', added);
            showToast(added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
            await renderFilterButtons();
        });

        galleryContainer.appendChild(card);
    });
}

// ─── Category Label ───────────────────────────────────────
async function getCategoryLabel(slug) {
    const cats = await getCategoriesCached();
    const cat = cats.find(c => slug === c.slug || slug.startsWith(c.slug + '-'));
    return cat ? cat.label : slug.replace(/-/g, ' ');
}

// ─── Lightbox ────────────────────────────────────────────
async function showLightboxItem(item) {
    lightboxImg.src              = item.url;
    lightboxImg.alt              = item.title || '';
    lightboxCategory.textContent = await getCategoryLabel(item.category);
    const MAX_PROMPT_LENGTH = 350;
    lightboxPrompt.textContent   = item.seed.length > MAX_PROMPT_LENGTH
        ? item.seed.slice(0, MAX_PROMPT_LENGTH).trimEnd() + '...'
        : item.seed;
    lightboxDownloadBtn.dataset.url      = item.url;
    lightboxDownloadBtn.dataset.filename = item.title || 'seed';
    currentSeed   = item.seed;
    currentItemId = item.id;
    lightbox.style.setProperty('--lb-bg', `url("${item.url.replace(/"/g, '\\"')}")`);
    resetCopyBtn(lightboxCopyBtn);

    const params = parseSeedParams(item.seed);
    lightboxParams.innerHTML = params
        .map(p => `<span class="param-badge">${p.label}<b>${p.value}</b></span>`)
        .join('');

    const faved = isFavorite(item.id);
    lightboxFavBtn.classList.toggle('active', faved);
    lightboxFavBtn.querySelector('.fav-btn-text').textContent = faved ? 'Favoritado' : 'Favoritar';

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

    if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        return;
    }

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

// ─── Swipe mobile ─────────────────────────────────────────
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

// ─── Favorite ─────────────────────────────────────────────
lightboxFavBtn.addEventListener('click', async () => {
    if (currentItemId === null) return;
    const added = toggleFavorite(currentItemId);
    lightboxFavBtn.classList.toggle('active', added);
    lightboxFavBtn.querySelector('.fav-btn-text').textContent = added ? 'Favoritado' : 'Favoritar';
    const card = galleryContainer.querySelector(`.card[data-id="${currentItemId}"]`);
    if (card) card.classList.toggle('favorited', added);
    await renderFilterButtons();
    showToast(added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
});

// ─── Share ────────────────────────────────────────────────
lightboxShareBtn.addEventListener('click', () => {
    const url = location.origin + location.pathname + '#seed-' + currentItemId;
    navigator.clipboard.writeText(url).then(() => showToast('Link copiado!')).catch(() => {
        prompt('Copie o link:', url);
    });
});

// ─── Gallery Search ───────────────────────────────────────
let _searchDebounce;
document.getElementById('gallery-search').addEventListener('input', (e) => {
    clearTimeout(_searchDebounce);
    _searchDebounce = setTimeout(async () => {
        searchQuery = e.target.value.trim().toLowerCase();
        await renderGallery(activeFilter, activeTag);
    }, 220);
});

// ─── Copy to clipboard ───────────────────────────────────
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

// ─── Toast ───────────────────────────────────────────────
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

// ─── Sidebar Toggle ──────────────────────────────────────
(function () {
    const btn = document.getElementById('sidebar-toggle');
    if (!btn) return;
    const STORAGE_KEY = 'sl_sidebar_collapsed';

    const apply = (collapsed) => {
        document.body.classList.toggle('sidebar-collapsed', collapsed);
        btn.textContent = collapsed ? '›' : '‹';
    };

    // Default: collapsed (sidebar recolhido para dar destaque às imagens)
    const saved = localStorage.getItem(STORAGE_KEY);
    apply(saved === null ? true : saved === '1');

    btn.addEventListener('click', () => {
        const collapsed = !document.body.classList.contains('sidebar-collapsed');
        apply(collapsed);
        localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    });
})();

// ─── Real-time sync via Supabase Realtime ─────────────────
sb
    .channel('public:seeds')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'seeds' }, () => {
        resetSeedsCache();
        renderFilterButtons();
        renderGallery(activeFilter, activeTag);
    })
    .subscribe();

sb
    .channel('public:categories')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        _categoriesCache = null;
        renderFilterButtons();
        renderGallery(activeFilter, activeTag);
    })
    .subscribe();

// ─── Hash Navigation ──────────────────────────────────────
async function checkHashNavigation() {
    const hash = location.hash;
    if (!hash.startsWith('#seed-')) return;
    const rawId = hash.replace('#seed-', '');
    const numId = Number(rawId);
    const all = await loadAllSeeds();
    const item = all.find(s => s.id === numId || String(s.id) === rawId);
    if (item) setTimeout(() => openLightbox(item), 80);
}

// ─── Init ────────────────────────────────────────────────
async function init() {
    const logo = await getLogo();
    // Logo is now an SVG image — only update subtitle and page title
    document.getElementById('logo-subtitle').textContent = logo.subtitle;
    document.title = logo.title;
    await renderFilterButtons();
    await renderGallery('all');
    await checkHashNavigation();

    // Service Worker disabled — Supabase data is always fresh
}

init();
