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
const ADMIN_USER  = 'admin';
// SHA-256 of 'seeds2026' — never store plaintext passwords in source
const PASS_HASH   = 'd2990e0040f6c89527a596afa3535dd2f89f886de43ec409b869d72a0b030f7b';

async function hashStr(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkAuth() {
    if (sessionStorage.getItem('sl_auth')) {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('admin-app').style.display = 'flex';
        initAdmin();
    }
}

document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user    = document.getElementById('admin-login-user').value.trim();
    const pass    = document.getElementById('admin-login-pass').value;
    const errEl   = document.getElementById('admin-login-error');
    const submitBtn = e.target.querySelector('[type="submit"]');

    submitBtn.disabled = true;
    const hash = await hashStr(pass);
    submitBtn.disabled = false;

    if (user === ADMIN_USER && hash === PASS_HASH) {
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
    const allTags    = getAllTags();
    const customSeeds = getCustomSeeds();
    const list = document.getElementById('categories-list');

    list.innerHTML = categories.map((cat, index) => {
        const count = customSeeds.filter(s => s.category === cat.slug).length;
        const countBadge = count > 0
            ? `<span class="category-count">${count}</span>`
            : '';
        return `
        <div class="category-item" data-slug="${cat.slug}" data-index="${index}">
            <div class="category-row">
                <button class="category-toggle icon-btn" data-action="toggle">▶</button>
                <span class="category-name">${cat.label}</span>
                ${countBadge}
                <div class="category-actions">
                    ${index > 0 ? `<button class="icon-btn" data-action="move-up" title="Mover para cima">↑</button>` : '<span style="width:24px;"></span>'}
                    ${index < categories.length - 1 ? `<button class="icon-btn" data-action="move-down" title="Mover para baixo">↓</button>` : '<span style="width:24px;"></span>'}
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
    `;
    }).join('');

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
                item.classList.add('removing');
                item.addEventListener('animationend', () => deleteCategory(slug), { once: true });
            }
        });
    });

    // Move category up/down
    list.querySelectorAll('[data-action="move-up"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.category-item');
            const index = parseInt(item.dataset.index);
            if (index > 0) moveCategory(index, index - 1);
        });
    });

    list.querySelectorAll('[data-action="move-down"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.category-item');
            const index = parseInt(item.dataset.index);
            const cats = getCategories();
            if (index < cats.length - 1) moveCategory(index, index + 1);
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

function moveCategory(fromIndex, toIndex) {
    const cats = getCategories();
    if (fromIndex < 0 || fromIndex >= cats.length || toIndex < 0 || toIndex >= cats.length) return;

    const [moved] = cats.splice(fromIndex, 1);
    cats.splice(toIndex, 0, moved);
    saveCategories(cats);
    renderCategories();
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
    const btn = event.currentTarget;
    const logo = {
        title:    document.getElementById('appearance-title').value.trim() || DEFAULT_LOGO.title,
        subtitle: document.getElementById('appearance-subtitle').value.trim() || DEFAULT_LOGO.subtitle,
    };
    saveLogo(logo);

    // Update page title
    document.title = `${logo.title} — Admin`;

    // Visual feedback on button
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = '✓ Salvo!';
    btn.style.backgroundColor = '#4ade80';

    showToast('Aparência salva!');

    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
    }, 1000);
});

// ─── Seeds ─────────────────────────────────────────────────
function renderCustomSeeds(query = '') {
    const allSeeds = getCustomSeeds();
    const grid     = document.getElementById('admin-seeds-grid');
    const q        = query.toLowerCase().trim();
    const seeds    = q ? allSeeds.filter(s => s.seed.toLowerCase().includes(q)) : allSeeds;

    if (allSeeds.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div style="font-size:2rem">🌱</div>
                <p>Nenhuma seed customizada ainda.</p>
            </div>
        `;
        return;
    }

    if (seeds.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>Nenhum resultado para "<strong>${query}</strong>".</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = seeds.map(seed => `
        <div class="admin-card" data-id="${seed.id}">
            <img src="${seed.url}" alt="" loading="lazy" class="admin-card-img">
            <div class="admin-card-info">
                <div class="admin-card-meta">${seed.category}${seed.tag ? ' · ' + seed.tag : ''}</div>
            </div>
            <div class="admin-card-actions">
                <button class="admin-card-btn admin-card-edit" data-id="${seed.id}" title="Editar">✎</button>
                <button class="admin-card-btn admin-card-delete" data-id="${seed.id}" title="Remover">✕</button>
            </div>
        </div>
    `).join('');

    // Click on card image → preview
    grid.querySelectorAll('.admin-card-img').forEach(img => {
        img.addEventListener('click', () => {
            const id   = Number(img.closest('.admin-card').dataset.id);
            const seed = getCustomSeeds().find(s => s.id === id);
            if (seed) openSeedPreview(seed);
        });
    });

    // Edit button
    grid.querySelectorAll('.admin-card-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id   = Number(btn.dataset.id);
            const seed = getCustomSeeds().find(s => s.id === id);
            if (seed) openEditSeedModal(seed);
        });
    });

    // Delete button
    grid.querySelectorAll('.admin-card-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Remover esta seed?')) {
                deleteCustomSeed(Number(btn.dataset.id));
            }
        });
    });
}

function deleteCustomSeed(id) {
    const seeds = getCustomSeeds();
    saveCustomSeeds(seeds.filter(s => s.id !== id));
    renderCustomSeeds(document.getElementById('seeds-search').value);
    showToast('Seed removida!');
}

// ─── Seed Preview Modal ────────────────────────────────────
function openSeedPreview(seed) {
    document.getElementById('preview-modal-title').textContent  = seed.title;
    document.getElementById('preview-modal-img').src            = seed.url;
    document.getElementById('preview-modal-img').alt            = seed.title;
    document.getElementById('preview-modal-meta').textContent   = seed.category + (seed.tag ? ' · ' + seed.tag : '');
    document.getElementById('preview-modal-prompt').textContent = seed.seed;

    const modal = document.getElementById('admin-preview-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeSeedPreview() {
    const modal = document.getElementById('admin-preview-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

document.getElementById('close-admin-preview-modal').addEventListener('click', closeSeedPreview);
document.getElementById('admin-preview-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('admin-preview-modal')) closeSeedPreview();
});
document.getElementById('preview-modal-copy').addEventListener('click', () => {
    const prompt = document.getElementById('preview-modal-prompt').textContent;
    navigator.clipboard.writeText(prompt).then(() => showToast('Prompt copiado!'));
});

// ─── Edit Seed Modal ───────────────────────────────────────
const adminEditModal     = document.getElementById('admin-edit-modal');
const adminEditSeedForm  = document.getElementById('admin-edit-seed-form');
const editFormCat        = document.getElementById('edit-form-category');
const editFormTag        = document.getElementById('edit-form-tag');
const editFormTagGrp     = document.getElementById('edit-form-tag-group');

function openEditSeedModal(seed) {
    const categories = getCategories();
    document.getElementById('edit-form-id').value   = seed.id;
    document.getElementById('edit-form-seed').value = seed.seed;

    editFormCat.innerHTML = '<option value="" disabled>Selecione...</option>' +
        categories.map(c => `<option value="${c.slug}"${c.slug === seed.category ? ' selected' : ''}>${c.label}</option>`).join('');

    // Populate tags for current category
    const tags = getAllTags()[seed.category] || [];
    if (tags.length > 0) {
        editFormTag.innerHTML = '<option value="">Sem tag</option>' +
            tags.map(t => `<option value="${t.toLowerCase()}"${t.toLowerCase() === seed.tag ? ' selected' : ''}>${t}</option>`).join('');
        editFormTagGrp.style.display = 'flex';
    } else {
        editFormTagGrp.style.display = 'none';
    }

    adminEditModal.classList.add('open');
    adminEditModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeEditSeedModal() {
    adminEditModal.classList.remove('open');
    adminEditModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    adminEditSeedForm.reset();
}

editFormCat.addEventListener('change', () => {
    const tags = getAllTags()[editFormCat.value] || [];
    if (tags.length > 0) {
        editFormTag.innerHTML = '<option value="">Sem tag</option>' +
            tags.map(t => `<option value="${t.toLowerCase()}">${t}</option>`).join('');
        editFormTagGrp.style.display = 'flex';
    } else {
        editFormTagGrp.style.display = 'none';
    }
});

document.getElementById('close-admin-edit-modal').addEventListener('click', closeEditSeedModal);
document.getElementById('cancel-admin-edit-modal').addEventListener('click', closeEditSeedModal);
adminEditModal.addEventListener('click', (e) => { if (e.target === adminEditModal) closeEditSeedModal(); });

adminEditSeedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id      = Number(document.getElementById('edit-form-id').value);
    const seeds   = getCustomSeeds();
    const index   = seeds.findIndex(s => s.id === id);
    if (index === -1) return;

    seeds[index] = {
        ...seeds[index],
        category: editFormCat.value,
        tag:      editFormTag.value || undefined,
        seed:     document.getElementById('edit-form-seed').value.trim(),
    };
    saveCustomSeeds(seeds);
    closeEditSeedModal();
    renderCustomSeeds(document.getElementById('seeds-search').value);
    showToast('Seed atualizada!');
});

// ─── Export / Import ───────────────────────────────────────
document.getElementById('export-seeds-btn').addEventListener('click', () => {
    const backup = {
        version:    1,
        exportedAt: new Date().toISOString(),
        categories: getCategories(),
        tags:       getAllTags(),
        logo:       getLogo(),
        seeds:      getCustomSeeds(),
    };
    const blob  = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = `seed-library-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado!');
});

// ─── Import Images ──────────────────────────────────────────
let pendingImports = [];

document.getElementById('import-seeds-btn').addEventListener('click', () => {
    document.getElementById('import-file-input').click();
});

document.getElementById('import-file-input').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';
    openImportModal(files);
});

async function openImportModal(files) {
    const modal = document.getElementById('admin-import-modal');
    const list  = document.getElementById('import-images-list');
    list.innerHTML = '<div style="padding:1rem;color:#666;font-size:0.85rem">Processando imagens…</div>';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const cats = getCategories();
    const catOptions = cats.map(c => `<option value="${c.slug}">${c.label}</option>`).join('');

    const dataUrls = await Promise.all(files.map(f => compressImage(f)));
    pendingImports = dataUrls.map((url, i) => ({ dataUrl: url, name: files[i].name }));

    list.innerHTML = pendingImports.map((item, i) => `
        <div class="import-item" data-index="${i}">
            <img src="${item.dataUrl}" class="import-item-thumb" alt="">
            <div class="import-item-fields">
                <div class="import-item-row">
                    <div class="form-group">
                        <label>Categoria</label>
                        <select class="import-cat-select">
                            <option value="" disabled selected>Selecione…</option>
                            ${catOptions}
                        </select>
                    </div>
                    <div class="form-group import-tag-group" style="display:none">
                        <label>Tag</label>
                        <select class="import-tag-select">
                            <option value="">Sem tag</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Seed / Prompt</label>
                    <textarea class="import-seed-input" rows="2" placeholder="--v 6.1 --ar 2:3 …"></textarea>
                </div>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('.import-cat-select').forEach(select => {
        select.addEventListener('change', () => {
            const item   = select.closest('.import-item');
            const tagGrp = item.querySelector('.import-tag-group');
            const tagSel = item.querySelector('.import-tag-select');
            const tags   = getAllTags()[select.value] || [];
            if (tags.length > 0) {
                tagSel.innerHTML = '<option value="">Sem tag</option>' +
                    tags.map(t => `<option value="${t.toLowerCase()}">${t}</option>`).join('');
                tagGrp.style.display = 'flex';
            } else {
                tagGrp.style.display = 'none';
            }
        });
    });
}

function closeImportModal() {
    const modal = document.getElementById('admin-import-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    pendingImports = [];
}

document.getElementById('close-import-modal').addEventListener('click', closeImportModal);
document.getElementById('cancel-import-modal').addEventListener('click', closeImportModal);
document.getElementById('admin-import-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('admin-import-modal')) closeImportModal();
});

document.getElementById('save-import-btn').addEventListener('click', () => {
    const items  = document.querySelectorAll('.import-item');
    const seeds  = getCustomSeeds();
    let saved    = 0;

    items.forEach((item, i) => {
        const catSel  = item.querySelector('.import-cat-select');
        const tagSel  = item.querySelector('.import-tag-select');
        const seedInp = item.querySelector('.import-seed-input');
        if (!catSel.value) return;

        const seedText = seedInp.value.trim();
        seeds.push({
            id:       Date.now() + i,
            title:    seedText.split(' ').slice(0, 4).join(' ') || 'seed',
            category: catSel.value,
            tag:      tagSel.value || undefined,
            url:      pendingImports[i].dataUrl,
            seed:     seedText,
        });
        saved++;
    });

    if (saved === 0) { showToast('Selecione ao menos uma categoria!'); return; }

    try {
        saveCustomSeeds(seeds);
        closeImportModal();
        renderCustomSeeds();
        showToast(`${saved} imagem(ns) importada(s)!`);
        warnIfStorageFull();
    } catch (err) {
        if (err.name === 'QuotaExceededError') {
            showToast('Armazenamento cheio! Exporte um backup.');
        } else {
            showToast('Erro ao salvar.');
        }
    }
});

// ─── Seeds Search ──────────────────────────────────────────
document.getElementById('seeds-search').addEventListener('input', (e) => {
    renderCustomSeeds(e.target.value);
});

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

// ─── Image Compression ─────────────────────────────────────
function compressImage(file, maxDim = 1200, quality = 0.82) {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const ratio  = Math.min(maxDim / img.width, maxDim / img.height, 1);
            const w      = Math.round(img.width * ratio);
            const h      = Math.round(img.height * ratio);
            const canvas = document.createElement('canvas');
            canvas.width  = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        img.src = url;
    });
}

// ─── Storage Health ─────────────────────────────────────────
function storageUsedPercent() {
    try {
        let total = 0;
        for (const key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                total += localStorage[key].length;
            }
        }
        return (total / (5 * 1024 * 1024)) * 100;
    } catch { return 0; }
}

function warnIfStorageFull() {
    const used = storageUsedPercent();
    if (used > 80) {
        showToast(`Armazenamento ${Math.round(used)}% cheio — exporte um backup!`);
    }
}

adminFormImage.addEventListener('change', async () => {
    const file = adminFormImage.files[0];
    if (!file) { adminImgPreview.innerHTML = ''; return; }
    const dataUrl = await compressImage(file);
    if (dataUrl) adminImgPreview.innerHTML = `<img src="${dataUrl}" alt="preview">`;
});

adminAddSeedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file      = adminFormImage.files[0];
    const submitBtn = e.target.querySelector('[type="submit"]');
    if (!file) return;

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Comprimindo…';

    const dataUrl = await compressImage(file);
    if (!dataUrl) {
        showToast('Erro ao processar imagem.');
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Adicionar';
        return;
    }

    try {
        const tagVal  = adminFormTag.value;
        const seedText = document.getElementById('admin-form-seed').value.trim();
        const newSeed = {
            id:       Date.now(),
            title:    seedText.split(' ').slice(0, 4).join(' ') || 'seed',
            category: adminFormCat.value,
            tag:      tagVal || undefined,
            url:      dataUrl,
            seed:     seedText,
        };
        const seeds = getCustomSeeds();
        seeds.push(newSeed);
        saveCustomSeeds(seeds);
        closeAddSeedModal();
        renderCustomSeeds();
        showToast('Seed adicionada!');
        warnIfStorageFull();
    } catch (err) {
        if (err.name === 'QuotaExceededError') {
            showToast('Armazenamento cheio! Exporte um backup e remova seeds antigas.');
        } else {
            showToast('Erro ao salvar seed.');
        }
    } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Adicionar';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAddSeedModal();
        closeEditSeedModal();
        closeSeedPreview();
        closeImportModal();
    }
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
