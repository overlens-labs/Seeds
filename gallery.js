// ─── Storage Keys (espelhado de main.js) ──────────────────
const GL_KEYS = {
    SEEDS:      'seedlibrary_custom',
    CATEGORIES: 'sl_categories',
    TAGS:       'sl_tags',
    FAVS:       'sl_favorites',
};

const GL_DEFAULT_CATEGORIES = [
    { slug: 'ilustracao',      label: 'Ilustração' },
    { slug: 'pintura',         label: 'Pintura' },
    { slug: 'cinematografico', label: 'Cinematográfico' },
    { slug: 'fotografia',      label: 'Fotografia' },
];

// ─── State ────────────────────────────────────────────────
let activeCategory = 'all';
let allSeeds       = [];
let lightboxImages = [];
let lightboxIndex  = 0;
let toastTimeout   = null;

// ─── Load data ────────────────────────────────────────────
function getCategories() {
    const stored = localStorage.getItem(GL_KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : GL_DEFAULT_CATEGORIES;
}

function loadSeeds() {
    const stored = localStorage.getItem(GL_KEYS.SEEDS);
    return stored ? JSON.parse(stored) : [];
}

// ─── Param parser ─────────────────────────────────────────
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

// ─── Group seeds by prompt ────────────────────────────────
// Seeds with the same prompt string become one SeedCard with multiple images
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
            });
        }
        map.get(key).images.push({ id: seed.id, url: seed.url, title: seed.title });
    });
    return Array.from(map.values());
}

// ─── Filter seeds ─────────────────────────────────────────
function getFilteredSeeds() {
    const favs = JSON.parse(localStorage.getItem(GL_KEYS.FAVS) || '[]');
    if (activeCategory === 'favorites') {
        return allSeeds.filter(s => favs.includes(s.id));
    }
    if (activeCategory === 'all') return allSeeds;
    return allSeeds.filter(s =>
        s.category === activeCategory || s.category.startsWith(activeCategory + '-')
    );
}

// ─── Render sidebar ───────────────────────────────────────
function renderSidebar() {
    const categories = getCategories();
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
                ? JSON.parse(localStorage.getItem(GL_KEYS.FAVS) || '[]').length
                : allSeeds.filter(s => s.category === slug || s.category.startsWith(slug + '-')).length;

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

// ─── Update header title ──────────────────────────────────
function updateCategoryTitle() {
    const categories = getCategories();
    const titleEl    = document.getElementById('category-title');
    const subEl      = document.getElementById('category-subtitle');

    if (activeCategory === 'all') {
        titleEl.textContent = 'All Styles';
        subEl.textContent   = 'Explore curated Midjourney seeds and copy them instantly.';
    } else if (activeCategory === 'favorites') {
        titleEl.textContent = 'Favorites';
        subEl.textContent   = 'Your saved seeds.';
    } else {
        const cat = categories.find(c => c.slug === activeCategory);
        const label = cat ? cat.label : activeCategory;
        titleEl.textContent = label + ' Styles';
        subEl.textContent   = `Explore ${label.toLowerCase()} Midjourney seeds.`;
    }
}

// ─── Render feed ──────────────────────────────────────────
function renderFeed() {
    const feed    = document.getElementById('seed-feed');
    const filtered = getFilteredSeeds();
    const grouped  = groupByPrompt(filtered);

    // Re-trigger animation
    feed.style.animation = 'none';
    feed.offsetHeight; // reflow
    feed.style.animation = '';

    if (grouped.length === 0) {
        feed.innerHTML = `
            <div class="empty-feed">
                <div style="font-size:2rem;margin-bottom:1rem">🌱</div>
                <p>No seeds here yet.</p>
                <p style="margin-top:0.5rem;font-size:0.72rem;opacity:0.5">Add seeds via the Admin panel.</p>
            </div>`;
        return;
    }

    feed.innerHTML = grouped.map((group, gi) => {
        const params    = parseSeedParams(group.prompt);
        const paramHTML = params.length
            ? `<div class="param-badges">${params.map(p => `<span class="param-badge">${p.label}<b>${p.value}</b></span>`).join('')}</div>`
            : '';

        const imagesHTML = group.images.map((img, ii) => `
            <div class="seed-img-wrap" data-group="${gi}" data-img="${ii}">
                <img src="${img.url}" alt="${img.title || group.prompt}" loading="lazy">
            </div>`).join('');

        const categoryLabel = group.category.replace(/-/g, ' ').toUpperCase();

        return `
            <article class="seed-card">
                <div class="prompt-container">
                    <p class="prompt-text">
                        <span class="prompt-prefix">[${categoryLabel}] </span>${group.prompt}
                    </p>
                    ${paramHTML}
                    <div class="card-actions">
                        <button class="copy-seed-btn" data-prompt="${escHtml(group.prompt)}">Copy Seed</button>
                    </div>
                </div>
                <div class="seed-images">${imagesHTML}</div>
            </article>`;
    }).join('');

    // Store grouped for lightbox navigation
    window._glGroups = grouped;

    // Copy buttons
    feed.querySelectorAll('.copy-seed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            navigator.clipboard.writeText(prompt).then(() => {
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                showToast('Seed copied!');
                setTimeout(() => {
                    btn.textContent = 'Copy Seed';
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(() => showToast('Copy failed'));
        });
    });

    // Lightbox on image click
    feed.querySelectorAll('.seed-img-wrap').forEach(wrap => {
        wrap.addEventListener('click', () => {
            const gi  = parseInt(wrap.dataset.group);
            const ii  = parseInt(wrap.dataset.img);
            const grp = window._glGroups[gi];
            openLightbox(grp.images, ii);
        });
    });
}

// ─── Escape HTML helper ───────────────────────────────────
function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Lightbox ─────────────────────────────────────────────
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

// ─── Toast ────────────────────────────────────────────────
function showToast(msg = 'Seed copied!') {
    const toast = document.getElementById('gl-toast');
    toast.textContent = msg;
    if (toastTimeout) { clearTimeout(toastTimeout); toast.classList.remove('show'); }
    setTimeout(() => {
        toast.classList.add('show');
        toastTimeout = setTimeout(() => { toast.classList.remove('show'); toastTimeout = null; }, 2000);
    }, 20);
}

// ─── Realtime sync (cross-tab) ────────────────────────────
window.addEventListener('storage', (e) => {
    if ([GL_KEYS.SEEDS, GL_KEYS.CATEGORIES, GL_KEYS.FAVS].includes(e.key)) {
        allSeeds = loadSeeds();
        renderSidebar();
        renderFeed();
    }
});

// ─── Init ─────────────────────────────────────────────────
function init() {
    allSeeds = loadSeeds();
    renderSidebar();
    updateCategoryTitle();
    renderFeed();
}

init();
