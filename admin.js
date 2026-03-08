// ─── Storage Keys ──────────────────────────────────────────
const SL_KEYS = {
    SEEDS:      'seedlibrary_custom',
    CATEGORIES: 'sl_categories',
    TAGS:       'sl_tags',
    LOGO:       'sl_logo',
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

// ─── Storage Helpers ───────────────────────────────────────
function getCategories() {
    const stored = localStorage.getItem(SL_KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
}

function saveCategories(cats) {
    localStorage.setItem(SL_KEYS.CATEGORIES, JSON.stringify(cats));
}

function getAllTags() {
    const stored = localStorage.getItem(SL_KEYS.TAGS);
    return stored ? JSON.parse(stored) : DEFAULT_TAGS;
}

function saveTags(tags) {
    localStorage.setItem(SL_KEYS.TAGS, JSON.stringify(tags));
}

function getLogo() {
    const stored = localStorage.getItem(SL_KEYS.LOGO);
    return stored ? JSON.parse(stored) : DEFAULT_LOGO;
}

function saveLogo(logo) {
    localStorage.setItem(SL_KEYS.LOGO, JSON.stringify(logo));
}

function getCustomSeeds() {
    const stored = localStorage.getItem(SL_KEYS.SEEDS);
    return stored ? JSON.parse(stored) : [];
}

function saveCustomSeeds(seeds) {
    localStorage.setItem(SL_KEYS.SEEDS, JSON.stringify(seeds));
}

// ─── Auth ──────────────────────────────────────────────────
const CREDS = { user: 'admin', pass: 'seeds2026' };

function checkAuth() {
    if (sessionStorage.getItem('sl_auth')) {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('admin-app').style.display = 'flex';
        initAdmin();
    }
}

document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('admin-login-user').value.trim();
    const pass = document.getElementById('admin-login-pass').value;
    const errEl = document.getElementById('admin-login-error');
    if (user === CREDS.user && pass === CREDS.pass) {
        sessionStorage.setItem('sl_auth', '1');
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('admin-app').style.display = 'flex';
        errEl.textContent = '';
        initAdmin();
    } else {
        errEl.textContent = 'Usuário ou senha incorretos.';
    }
});

document.getElementById('admin-logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('sl_auth');
    document.getElementById('admin-app').style.display = 'none';
    document.getElementById('login-overlay').classList.remove('hidden');
    document.getElementById('admin-login-form').reset();
    document.getElementById('admin-login-error').textContent = '';
});

// ─── Init Admin ────────────────────────────────────────────
function initAdmin() {
    renderCategories();
    initAppearanceForm();
    renderCustomSeeds();
}

// ─── Navigation ────────────────────────────────────────────
function showSection(id) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById('section-' + id).classList.add('active');
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.admin-nav-btn[data-section="${id}"]`).classList.add('active');
}

document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
});

// ─── Categories ────────────────────────────────────────────
function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function renderCategories() {
    const categories = getCategories();
    const allTags = getAllTags();
    const list = document.getElementById('categories-list');

    list.innerHTML = categories.map((cat, index) => `
        <div class="category-item" data-slug="${cat.slug}" data-index="${index}">
            <div class="category-row">
                <button class="category-toggle icon-btn" data-action="toggle">▶</button>
                <span class="category-name">${cat.label}</span>
                <div class="category-actions">
                    <button class="icon-btn" data-action="rename" title="Renomear">✎</button>
                    <button class="icon-btn danger" data-action="delete" title="Deletar">🗑</button>
                </div>
            </div>
            <div class="category-tags-panel" hidden>
                <div class="tag-pills" id="pills-${cat.slug}">
                    ${(allTags[cat.slug] || []).map(tag => `
                        <span class="tag-pill">
                            ${tag}
                            <button class="tag-pill-remove" data-tag="${tag}" data-category="${cat.slug}">✕</button>
                        </span>
                    `).join('')}
                    ${(allTags[cat.slug] || []).length === 0 ? '<span style="font-size:0.75rem;color:#555;">Nenhuma tag ainda.</span>' : ''}
                </div>
                <div class="add-tag-form">
                    <input type="text" placeholder="Nova tag..." data-category="${cat.slug}">
                    <button type="button" data-category="${cat.slug}">+</button>
                </div>
            </div>
        </div>
    `).join('');

    // Toggle expand/collapse
    list.querySelectorAll('[data-action="toggle"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.category-item');
            const panel = item.querySelector('.category-tags-panel');
            const isOpen = !panel.hidden;
            panel.hidden = isOpen;
            item.classList.toggle('open', !isOpen);
        });
    });

    // Inline rename
    list.querySelectorAll('[data-action="rename"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.category-item');
            const nameSpan = item.querySelector('.category-name');
            const currentLabel = nameSpan.textContent;
            const index = parseInt(item.dataset.index);

            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentLabel;
            input.className = 'category-rename-input';
            nameSpan.replaceWith(input);
            input.focus();
            input.select();

            const save = () => {
                const newLabel = input.value.trim();
                if (newLabel && newLabel !== currentLabel) {
                    renameCategory(index, newLabel);
                } else {
                    renderCategories();
                }
            };

            input.addEventListener('blur', save);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); save(); }
                if (e.key === 'Escape') { e.stopPropagation(); renderCategories(); }
            });
        });
    });

    // Delete category
    list.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.category-item');
            const slug = item.dataset.slug;
            const label = item.querySelector('.category-name') ?
                item.querySelector('.category-name').textContent :
                slug;
            if (confirm(`Deletar a categoria "${label}" e todas as suas tags?`)) {
                deleteCategory(slug);
            }
        });
    });

    // Remove tag pill
    list.querySelectorAll('.tag-pill-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            deleteTag(btn.dataset.category, btn.dataset.tag);
        });
    });

    // Add tag inline
    list.querySelectorAll('.add-tag-form').forEach(form => {
        const input = form.querySelector('input');
        const addBtn = form.querySelector('button');
        const category = input.dataset.category;

        const doAdd = () => {
            const label = input.value.trim();
            if (label) {
                addTag(category, label);
            }
        };

        addBtn.addEventListener('click', doAdd);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
        });
    });
}

function addCategory(label) {
    const cats = getCategories();
    const slug = slugify(label);
    if (!slug) return;
    if (cats.some(c => c.slug === slug)) {
        showToast('Categoria já existe!');
        return;
    }
    cats.push({ slug, label });
    saveCategories(cats);
    renderCategories();
    showToast('Categoria criada!');
}

function deleteCategory(slug) {
    let cats = getCategories();
    cats = cats.filter(c => c.slug !== slug);
    saveCategories(cats);

    const tags = getAllTags();
    delete tags[slug];
    saveTags(tags);

    renderCategories();
    showToast('Categoria deletada!');
}

function renameCategory(index, newLabel) {
    const cats = getCategories();
    cats[index].label = newLabel;
    saveCategories(cats);
    renderCategories();
    showToast('Categoria renomeada!');
}

function addTag(categorySlug, label) {
    const tags = getAllTags();
    if (!tags[categorySlug]) tags[categorySlug] = [];
    if (tags[categorySlug].includes(label)) {
        showToast('Tag já existe!');
        return;
    }
    tags[categorySlug].push(label);
    saveTags(tags);
    renderCategories();

    // Re-open the accordion panel after re-render
    const item = document.querySelector(`.category-item[data-slug="${categorySlug}"]`);
    if (item) {
        const panel = item.querySelector('.category-tags-panel');
        panel.hidden = false;
        item.classList.add('open');
    }
    showToast('Tag adicionada!');
}

function deleteTag(categorySlug, label) {
    const tags = getAllTags();
    if (tags[categorySlug]) {
        tags[categorySlug] = tags[categorySlug].filter(t => t !== label);
        saveTags(tags);
        renderCategories();

        // Re-open panel
        const item = document.querySelector(`.category-item[data-slug="${categorySlug}"]`);
        if (item) {
            const panel = item.querySelector('.category-tags-panel');
            panel.hidden = false;
            item.classList.add('open');
        }
        showToast('Tag removida!');
    }
}

// Add category button
document.getElementById('add-category-btn').addEventListener('click', () => {
    const input = document.getElementById('new-category-input');
    const label = input.value.trim();
    if (label) {
        addCategory(label);
        input.value = '';
    }
});

document.getElementById('new-category-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const label = e.target.value.trim();
        if (label) {
            addCategory(label);
            e.target.value = '';
        }
    }
});

// ─── Appearance ────────────────────────────────────────────
function initAppearanceForm() {
    const logo = getLogo();
    const titleInput    = document.getElementById('appearance-title');
    const subtitleInput = document.getElementById('appearance-subtitle');
    const previewTitle  = document.getElementById('preview-title');
    const previewSub    = document.getElementById('preview-subtitle');

    titleInput.value    = logo.title;
    subtitleInput.value = logo.subtitle;
    previewTitle.textContent = logo.title;
    previewSub.textContent   = logo.subtitle;

    // Remove old listeners by cloning
    const newTitle = titleInput.cloneNode(true);
    const newSub   = subtitleInput.cloneNode(true);
    titleInput.replaceWith(newTitle);
    subtitleInput.replaceWith(newSub);

    newTitle.addEventListener('input', () => {
        previewTitle.textContent = newTitle.value || DEFAULT_LOGO.title;
    });
    newSub.addEventListener('input', () => {
        previewSub.textContent = newSub.value || DEFAULT_LOGO.subtitle;
    });
}

document.getElementById('save-appearance-btn').addEventListener('click', () => {
    const logo = {
        title:    document.getElementById('appearance-title').value.trim() || DEFAULT_LOGO.title,
        subtitle: document.getElementById('appearance-subtitle').value.trim() || DEFAULT_LOGO.subtitle,
    };
    saveLogo(logo);
    showToast('Aparência salva!');
});

// ─── Seeds ─────────────────────────────────────────────────
function renderCustomSeeds() {
    const seeds = getCustomSeeds();
    const grid  = document.getElementById('admin-seeds-grid');

    if (seeds.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div style="font-size:2rem">🌱</div>
                <p>Nenhuma seed customizada ainda.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = seeds.map(seed => `
        <div class="admin-card" data-id="${seed.id}">
            <img src="${seed.url}" alt="${seed.title}" loading="lazy">
            <div class="admin-card-info">
                <div class="admin-card-title">${seed.title}</div>
                <div class="admin-card-meta">${seed.category}${seed.tag ? ' · ' + seed.tag : ''}</div>
            </div>
            <button class="admin-card-delete" data-id="${seed.id}" title="Remover">✕</button>
        </div>
    `).join('');

    grid.querySelectorAll('.admin-card-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Remover esta seed?')) {
                deleteCustomSeed(Number(btn.dataset.id));
            }
        });
    });
}

function deleteCustomSeed(id) {
    const seeds = getCustomSeeds();
    saveCustomSeeds(seeds.filter(s => s.id !== id));
    renderCustomSeeds();
    showToast('Seed removida!');
}

// ─── Add Seed Modal ────────────────────────────────────────
const adminAddModal    = document.getElementById('admin-add-modal');
const adminAddSeedForm = document.getElementById('admin-add-seed-form');
const adminFormImage   = document.getElementById('admin-form-image');
const adminImgPreview  = document.getElementById('admin-img-preview');
const adminFormCat     = document.getElementById('admin-form-category');
const adminFormTag     = document.getElementById('admin-form-tag');
const adminFormTagGrp  = document.getElementById('admin-form-tag-group');

function openAddSeedModal() {
    const categories = getCategories();
    adminFormCat.innerHTML = '<option value="" disabled selected>Selecione...</option>' +
        categories.map(c => `<option value="${c.slug}">${c.label}</option>`).join('');
    adminFormTagGrp.style.display = 'none';
    adminAddModal.classList.add('open');
    adminAddModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeAddSeedModal() {
    adminAddModal.classList.remove('open');
    adminAddModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    adminAddSeedForm.reset();
    adminImgPreview.innerHTML = '';
    adminFormTagGrp.style.display = 'none';
}

document.getElementById('open-admin-add-modal').addEventListener('click', openAddSeedModal);
document.getElementById('close-admin-add-modal').addEventListener('click', closeAddSeedModal);
document.getElementById('cancel-admin-add-modal').addEventListener('click', closeAddSeedModal);

adminAddModal.addEventListener('click', (e) => {
    if (e.target === adminAddModal) closeAddSeedModal();
});

adminFormCat.addEventListener('change', () => {
    const cat  = adminFormCat.value;
    const tags = getAllTags()[cat] || [];
    if (tags.length > 0) {
        adminFormTag.innerHTML = '<option value="">Sem tag</option>' +
            tags.map(t => `<option value="${t.toLowerCase()}">${t}</option>`).join('');
        adminFormTagGrp.style.display = 'flex';
    } else {
        adminFormTagGrp.style.display = 'none';
    }
});

adminFormImage.addEventListener('change', () => {
    const file = adminFormImage.files[0];
    if (!file) { adminImgPreview.innerHTML = ''; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        adminImgPreview.innerHTML = `<img src="${e.target.result}" alt="preview">`;
    };
    reader.readAsDataURL(file);
});

adminAddSeedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const file = adminFormImage.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const tagVal = adminFormTag.value;
        const newSeed = {
            id:       Date.now(),
            title:    document.getElementById('admin-form-title').value.trim(),
            category: adminFormCat.value,
            tag:      tagVal || undefined,
            url:      ev.target.result,
            seed:     document.getElementById('admin-form-seed').value.trim(),
        };
        const seeds = getCustomSeeds();
        seeds.push(newSeed);
        saveCustomSeeds(seeds);
        closeAddSeedModal();
        renderCustomSeeds();
        showToast('Seed adicionada!');
    };
    reader.readAsDataURL(file);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAddSeedModal();
});

// ─── Toast ─────────────────────────────────────────────────
let adminToastTimeout;

function showToast(msg = 'Salvo!') {
    const toast = document.getElementById('admin-toast');
    toast.querySelector('.toast-message').textContent = msg;
    if (adminToastTimeout) {
        clearTimeout(adminToastTimeout);
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('show');
            adminToastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
        }, 50);
        return;
    }
    toast.classList.add('show');
    adminToastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        adminToastTimeout = null;
    }, 2000);
}

// ─── Init ──────────────────────────────────────────────────
checkAuth();
