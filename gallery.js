// ─── Local-only Keys ──────────────────────────────────────
const GL_KEYS = {
    FAVS: 'sl_favorites',
};

const GL_DEFAULT_CATEGORIES = [
    { slug: 'ilustracao',      label: 'Ilustração', sort_order: 0 },
    { slug: 'pintura',         label: 'Pintura',    sort_order: 1 },
    { slug: 'cinematografico', label: 'Cinematográfico', sort_order: 2 },
    { slug: 'fotografia',      label: 'Fotografia', sort_order: 3 },
];

// ─── SVG Icon Library ─────────────────────────────────────
const ICON = {
    copy:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    check:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    heart:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    heartFill:`<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    download: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    plant:    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 1 1.1 4.8c-1.9 0-3.4-.3-4.8-1.2-.7-.5-1.4-1.4-1.9-2.8 1.9-1 4.4-.4 5.6-.8z"/></svg>`,
    search:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
};

// ─── State ───────────────────────────────────────────────
let activeCategory = 'all';
let searchQuery    = '';
let allSeeds       = [];
let favs           = [];
let lightboxImages = [];
let lightboxIndex  = 0;
let toastTimeout   = null;

// ─── Supabase Data helpers ───────────────────────────────
async function getCategories() {
    const { data, error } = await sb
        .from('categories')
        .select('*')
        .order('sort_order');
    if (error || !data || data.length === 0) return GL_DEFAULT_CATEGORIES;
    return data;
}

async function loadSeeds() {
    const { data, error } = await sb.from('seeds').select('*');
    return (!error && data) ? data : [];
}

function loadFavs() {
    return JSON.parse(localStorage.getItem(GL_KEYS.FAVS) || '[]');
}

function saveFavs() {
    localStorage.setItem(GL_KEYS.FAVS, JSON.stringify(favs));
}

// ─── Param parser ────────────────────────────────────────
function parseSeedParams(seed) {
    const patterns = [
        { regex: /--v\s+([\d.]+)/i,       label: 'v' },
        { regex: /--ar\s+([\d:]+)/i,       label: 'ar' },
        { regex: /--stylize\s+(\d+)/i,     label: 's' },
        { regex: /\s--s\s+(\d+)/i,         label: 's' },
        { regex: /--chaos\s+(\d+)/i,       label: 'chaos' },
        { regex: /--sref\s+(\w+)/i,        label: 'sref' },
        { regex: /--style\s+([\w-]+)/i,    label: 'style' },
        { regex: /--seed\s+(\d+)/i,        label: 'seed' },
        { regex: /--niji\s+(\d+)/i,        label: 'niji' },
    ];
    const seen = new Set();
    return patterns.reduce((acc, { regex, label }) => {
        if (seen.has(label)) return acc;
        const m = seed.match(regex);
        if (m) { seen.add(label); acc.push({ label, value: m[1] }); }
        return acc;
    }, []);
}

// ─── Escape HTML ─────────────────────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ─── Group seeds by prompt ───────────────────────────────
function groupByPrompt(seeds) {
    const map = new Map();
    seeds.forEach(seed => {
        const key = seed.seed.trim();
        if (!map.has(key)) {
            map.set(key, {
                prompt:   seed.seed,
                category: seed.category,
                tag:      seed.tag,
                images:   [],
                ids:      [],
            });
        }
        map.get(key).images.push({ id: seed.id, url: seed.url, title: seed.title });
        map.get(key).ids.push(seed.id);
    });
    return Array.from(map.values());
}

// ─── Filter seeds ────────────────────────────────────────
function getFilteredSeeds() {
    let filtered = allSeeds;

    if (activeCategory === 'favorites') {
        filtered = filtered.filter(s => favs.includes(s.id));
    } else if (activeCategory !== 'all') {
        filtered = filtered.filter(s =>
            s.category === activeCategory || s.category.startsWith(activeCategory + '-')
        );
    }

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(s =>
            s.seed.toLowerCase().includes(q) ||
            (s.category || '').toLowerCase().includes(q) ||
            (s.tag || '').toLowerCase().includes(q)
        );
    }

    return filtered;
}

// ─── Render sidebar ──────────────────────────────────────
async function renderSidebar() {
    const categories = await getCategories();
    const list = document.getElementById('category-list');

    const items = [
        { slug: 'all',       label: 'All' },
        { slug: 'favorites', label: 'Favorites' },
        ...categories,
    ];

    list.innerHTML = items.map(({ slug, label }) => {
        const count = slug === 'all'
            ? allSeeds.length
            : slug === 'favorites'
                ? favs.length
                : allSeeds.filter(s =>
                    s.category === slug || s.category.startsWith(slug + '-')
                  ).length;

        const badge = count > 0 ? `<span class="category-count-badge">${count}</span>` : '';

        return `
            <li>
                <button class="category-btn${activeCategory === slug ? ' active' : ''}" data-slug="${slug}">
                    ${label}${badge}
                </button>
            </li>`;
    }).join('');

    list.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeCategory = btn.dataset.slug;
            updateCategoryTitle();
            renderFeed();
            renderSidebar();
        });
    });
}

// ─── Update header ───────────────────────────────────────
async function updateCategoryTitle() {
    const categories = await getCategories();
    const titleEl    = document.getElementById('category-title');
    const subEl      = document.getElementById('category-subtitle');

    if (activeCategory === 'all') {
        titleEl.textContent = 'All Styles';
        subEl.textContent   = 'Explore curated Midjourney seeds and copy them instantly.';
    } else if (activeCategory === 'favorites') {
        titleEl.textContent = 'Favorites';
        subEl.textContent   = 'Your saved seeds.';
    } else {
        const cat   = categories.find(c => c.slug === activeCategory);
        const label = cat ? cat.label : activeCategory;
        titleEl.textContent = label + ' Styles';
        subEl.textContent   = `Explore ${label.toLowerCase()} Midjourney seeds.`;
    }
}

// ─── Render feed ─────────────────────────────────────────
function renderFeed() {
    const skeletonEl = document.getElementById('skeleton-feed');
    const feed       = document.getElementById('seed-feed');

    if (skeletonEl) skeletonEl.style.display = 'none';
    feed.style.display = '';

    const grouped = groupByPrompt(getFilteredSeeds());

    feed.style.animation = 'none';
    feed.offsetHeight;
    feed.style.animation = '';

    if (grouped.length === 0) {
        const isSearch = searchQuery.length > 0;
        feed.innerHTML = `
            <div class="empty-feed">
                <div class="empty-feed-icon">${ICON.plant}</div>
                <p class="empty-feed-title">${isSearch ? 'No results' : 'No seeds yet'}</p>
                <p class="empty-feed-sub">${
                    isSearch
                        ? `No seeds match "<strong>${escHtml(searchQuery)}</strong>"`
                        : 'Add seeds via the Admin panel to get started.'
                }</p>
                ${isSearch ? '' : `<a href="admin.html" class="empty-feed-cta">Open Admin</a>`}
            </div>`;
        return;
    }

    window._glGroups = grouped;

    feed.innerHTML = grouped.map((group, gi) => {
        const params    = parseSeedParams(group.prompt);
        const paramHTML = params.length
            ? `<div class="param-badges">${
                params.map(p =>
                    `<span class="param-badge">${p.label}<b>${p.value}</b></span>`
                ).join('')
              }</div>`
            : '';

        const categoryLabel = group.category.replace(/-/g, ' ').toUpperCase();
        const isFaved       = group.ids.some(id => favs.includes(id));
        const isCarousel    = group.images.length > 2;

        let imagesHTML;

        if (isCarousel) {
            const imgWraps = group.images.map((img, ii) => `
                <div class="seed-img-wrap carousel-img-wrap" data-group="${gi}" data-img="${ii}">
                    <img src="${escHtml(img.url)}" alt="${escHtml(img.title || group.prompt)}" loading="lazy">
                </div>`).join('');

            const dots = group.images.map((_, ii) => `
                <button class="carousel-dot${ii === 0 ? ' active' : ''}" data-carousel="${gi}" data-dot="${ii}"></button>`
            ).join('');

            imagesHTML = `
                <div class="seed-images seed-images--carousel" data-carousel="${gi}" data-current="0">
                    <div class="seed-imgs-track">${imgWraps}</div>
                    <button class="carousel-nav-btn carousel-prev" data-carousel="${gi}" data-dir="-1">&#8249;</button>
                    <button class="carousel-nav-btn carousel-next" data-carousel="${gi}" data-dir="1">&#8250;</button>
                    <div class="carousel-dots">${dots}</div>
                </div>`;
        } else {
            const imgWraps = group.images.map((img, ii) => `
                <div class="seed-img-wrap" data-group="${gi}" data-img="${ii}">
                    <img src="${escHtml(img.url)}" alt="${escHtml(img.title || group.prompt)}" loading="lazy">
                </div>`).join('');
            imagesHTML = `<div class="seed-images">${imgWraps}</div>`;
        }

        const dlBtn = group.images.length === 1
            ? `<button class="ghost-btn dl-btn" data-url="${escHtml(group.images[0].url)}" data-prompt="${escHtml(group.prompt)}">
                ${ICON.download} Download
               </button>`
            : '';

        return `
            <article class="seed-card">
                <div class="prompt-container">
                    <p class="prompt-text">
                        <span class="prompt-prefix">[${categoryLabel}]&nbsp;</span>${escHtml(group.prompt)}
                    </p>
                    ${paramHTML}
                    <div class="card-actions">
                        <button class="copy-seed-btn" data-prompt="${escHtml(group.prompt)}">
                            ${ICON.copy} Copy Seed
                        </button>
                        <button class="ghost-btn fav-btn${isFaved ? ' fav-active' : ''}" data-ids="${group.ids.join(',')}">
                            ${isFaved ? ICON.heartFill : ICON.heart} ${isFaved ? 'Saved' : 'Save'}
                        </button>
                        ${dlBtn}
                    </div>
                </div>
                ${imagesHTML}
            </article>`;
    }).join('');

    attachFeedListeners(feed);
}

// ─── Feed event listeners ────────────────────────────────
function attachFeedListeners(feed) {
    feed.querySelectorAll('.copy-seed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(btn.dataset.prompt).then(() => {
                btn.innerHTML = `${ICON.check} Copied!`;
                btn.classList.add('copied');
                showToast('Seed copied!');
                setTimeout(() => {
                    btn.innerHTML = `${ICON.copy} Copy Seed`;
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(() => showToast('Copy failed'));
        });
    });

    feed.querySelectorAll('.fav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ids     = btn.dataset.ids.split(',');
            const anyFaved = ids.some(id => favs.includes(id));
            if (anyFaved) {
                favs = favs.filter(f => !ids.includes(f));
                btn.innerHTML = `${ICON.heart} Save`;
                btn.classList.remove('fav-active');
                showToast('Removed from favorites');
            } else {
                ids.forEach(id => { if (!favs.includes(id)) favs.push(id); });
                btn.innerHTML = `${ICON.heartFill} Saved`;
                btn.classList.add('fav-active');
                showToast('Saved to favorites!');
            }
            saveFavs();
            renderSidebar();
        });
    });

    feed.querySelectorAll('.dl-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const a    = document.createElement('a');
            a.href     = btn.dataset.url;
            a.download = 'seed.jpg';
            a.target   = '_blank';
            a.click();
            showToast('Downloading...');
        });
    });

    feed.querySelectorAll('.carousel-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateCarousel(btn.dataset.carousel, parseInt(btn.dataset.dir));
        });
    });

    feed.querySelectorAll('.carousel-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            setCarouselIndex(dot.dataset.carousel, parseInt(dot.dataset.dot));
        });
    });

    feed.querySelectorAll('.seed-img-wrap:not(.carousel-img-wrap)').forEach(wrap => {
        wrap.addEventListener('click', () => {
            const grp = window._glGroups[parseInt(wrap.dataset.group)];
            openLightbox(grp.images, parseInt(wrap.dataset.img));
        });
    });

    feed.querySelectorAll('.carousel-img-wrap').forEach(wrap => {
        wrap.addEventListener('click', () => {
            const grp = window._glGroups[parseInt(wrap.dataset.group)];
            openLightbox(grp.images, parseInt(wrap.dataset.img));
        });
    });
}

// ─── Carousel Component ──────────────────────────────────
function navigateCarousel(carouselId, dir) {
    const el = document.querySelector(`.seed-images--carousel[data-carousel="${carouselId}"]`);
    if (!el) return;
    const total   = el.querySelectorAll('.carousel-img-wrap').length;
    const current = parseInt(el.dataset.current || '0');
    setCarouselIndex(carouselId, (current + dir + total) % total);
}

function setCarouselIndex(carouselId, index) {
    const el    = document.querySelector(`.seed-images--carousel[data-carousel="${carouselId}"]`);
    if (!el) return;
    const track = el.querySelector('.seed-imgs-track');
    const dots  = el.querySelectorAll('.carousel-dot');

    if (track) track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    el.dataset.current = index;
}

// ─── Lightbox ────────────────────────────────────────────
function openLightbox(images, index) {
    lightboxImages = images;
    lightboxIndex  = index;
    showLightboxImage();
    const lb = document.getElementById('lightbox');
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { document.getElementById('gl-lb-img').src = ''; }, 300);
}

function showLightboxImage() {
    const img = lightboxImages[lightboxIndex];
    document.getElementById('gl-lb-img').src = img.url;
    document.getElementById('gl-lb-img').alt = img.title || '';
}

function navigateLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
    showLightboxImage();
}

document.getElementById('gl-lb-close').addEventListener('click', closeLightbox);
document.getElementById('gl-lb-prev').addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
document.getElementById('gl-lb-next').addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });
document.getElementById('lightbox').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeLightbox(); });

document.addEventListener('keydown', (e) => {
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
});

// ─── Toast Component ─────────────────────────────────────
function showToast(msg = 'Seed copied!') {
    const toast = document.getElementById('gl-toast');
    const msgEl = document.getElementById('gl-toast-msg');
    if (msgEl) msgEl.textContent = msg;
    if (toastTimeout) { clearTimeout(toastTimeout); toast.classList.remove('show'); }
    setTimeout(() => {
        toast.classList.add('show');
        toastTimeout = setTimeout(() => { toast.classList.remove('show'); toastTimeout = null; }, 2000);
    }, 20);
}

// ─── Search Component ────────────────────────────────────
document.getElementById('gl-search').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderFeed();
});

// ─── Real-time sync via Supabase Realtime ────────────────
sb
    .channel('gallery:seeds')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'seeds' }, async () => {
        allSeeds = await loadSeeds();
        await renderSidebar();
        renderFeed();
    })
    .subscribe();

// ─── Init ────────────────────────────────────────────────
async function init() {
    allSeeds = await loadSeeds();
    favs     = loadFavs();
    await renderSidebar();
    await updateCategoryTitle();
    setTimeout(renderFeed, 280);
}

init();
