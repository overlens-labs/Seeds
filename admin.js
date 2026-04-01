// ─── Admin Storage Client (service role — admin only) ────────
const SUPABASE_SERVICE_KEY = 'sb_secret_JjvPrwWzeVg1SnM6kpyTDQ_LL3GPnZU';
const sbAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

// ─── Defaults ──────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
    { slug: 'ilustracao',      label: 'Ilustração', sort_order: 0 },
    { slug: 'pintura',         label: 'Pintura',    sort_order: 1 },
    { slug: 'cinematografico', label: 'Cinematográfico', sort_order: 2 },
    { slug: 'fotografia',      label: 'Fotografia', sort_order: 3 },
];

const DEFAULT_TAGS = {
    'ilustracao':      ['Anime', 'Fantasia', 'Sci-Fi', 'Retrato'],
    'pintura':         ['Aquarela', 'Óleo', 'Digital', 'Acrílico'],
    'cinematografico': ['Noir', 'Sci-Fi', 'Drama', 'Terror'],
    'fotografia':      ['3D', 'Abstrata', 'Rêtro', 'Estilizada'],
};

const DEFAULT_LOGO = { title: 'Seed Library', subtitle: 'Descubra e copie prompts incríveis.' };

// ─── Supabase Data Helpers ────────────────────────────────
async function getCategories() {
    const { data, error } = await sb
        .from('categories')
        .select('*')
        .order('sort_order');
    if (error || !data || data.length === 0) return DEFAULT_CATEGORIES;
    return data;
}

async function saveCategories(cats) {
    // Upsert all categories with sort_order
    for (let i = 0; i < cats.length; i++) {
        const cat = cats[i];
        await sbAdmin.from('categories').upsert({
            slug: cat.slug,
            label: cat.label,
            sort_order: i,
        }, { onConflict: 'slug' });
    }
}

async function getAllTags() {
    const { data, error } = await sbAdmin.from('tags').select('*');
    if (error || !data) return {};
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

async function saveLogo(logo) {
    await sbAdmin.from('settings').upsert({ key: 'logo', value: logo }, { onConflict: 'key' });
}

async function getCustomSeeds() {
    const { data, error } = await sbAdmin.from('seeds').select('*').order('created_at', { ascending: false });
    return (!error && data) ? data : [];
}

async function saveNewSeed(seed) {
    const { data, error } = await sbAdmin.from('seeds').insert(seed).select().single();
    if (error) throw error;
    return data;
}

async function updateSeed(id, updates) {
    const { error } = await sbAdmin.from('seeds').update(updates).eq('id', id);
    if (error) throw error;
}

async function deleteSeed(id) {
    const { error } = await sbAdmin.from('seeds').delete().eq('id', id);
    if (error) throw error;
}

// ─── Auth (Supabase Auth) ─────────────────────────────────
let adminInitialized = false;

const adminFab     = document.getElementById('admin-fab');
const adminApp     = document.getElementById('admin-app');
const loginOverlay = document.getElementById('login-overlay');

function openAdminPanel(section = 'seeds') {
    adminApp.style.display = 'flex';
    adminFab.classList.add('is-open');
    // Navigate to the requested section (default: seeds for saving images)
    showSection(section);
}

function closeAdminPanel() {
    adminApp.style.display = 'none';
    adminFab.classList.remove('is-open');
}

async function checkAuth() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        adminFab.classList.add('is-logged-in');
    }
}

// FAB click: show login if not logged in, toggle panel if logged in
adminFab.addEventListener('click', async () => {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
        loginOverlay.classList.remove('hidden');
        return;
    }
    if (adminApp.style.display === 'flex') {
        closeAdminPanel();
    } else {
        openAdminPanel();
        if (!adminInitialized) {
            await initAdmin();
            adminInitialized = true;
        }
    }
});

// Close panel when clicking "← Ver Galeria"
document.getElementById('admin-back-link').addEventListener('click', (e) => {
    e.preventDefault();
    closeAdminPanel();
});

document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email   = document.getElementById('admin-login-email').value.trim();
    const pass    = document.getElementById('admin-login-pass').value;
    const errEl   = document.getElementById('admin-login-error');
    const submitBtn = e.target.querySelector('[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando...';

    const { error } = await sb.auth.signInWithPassword({
        email: email,
        password: pass,
    });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Entrar';

    if (error) {
        errEl.textContent = 'Email ou senha incorretos.';
    } else {
        loginOverlay.classList.add('hidden');
        errEl.textContent = '';
        adminFab.classList.add('is-logged-in');
        openAdminPanel();
        if (!adminInitialized) {
            await initAdmin();
            adminInitialized = true;
        }
    }
});

document.getElementById('admin-logout-btn').addEventListener('click', async () => {
    await sb.auth.signOut();
    closeAdminPanel();
    adminFab.classList.remove('is-logged-in');
    adminInitialized = false;
    document.getElementById('admin-login-form').reset();
    document.getElementById('admin-login-error').textContent = '';
});

// ─── Init Admin ───────────────────────────────────────────
async function initAdmin() {
    await renderCategories();
    await initAppearanceForm();
    await renderCustomSeeds();
}

// ─── Navigation ───────────────────────────────────────────
function showSection(id) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById('section-' + id).classList.add('active');
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.admin-nav-btn[data-section="${id}"]`).classList.add('active');
}

document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
});

// ─── Categories ───────────────────────────────────────────
function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function renderCategories() {
    const categories = await getCategories();
    const allTags    = await getAllTags();
    const customSeeds = await getCustomSeeds();
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

            const save = async () => {
                const newLabel = input.value.trim();
                if (newLabel && newLabel !== currentLabel) {
                    await renameCategory(index, newLabel);
                } else {
                    await renderCategories();
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
                item.querySelector('.category-name').textContent : slug;
            if (confirm(`Deletar a categoria "${label}" e todas as suas tags?`)) {
                item.classList.add('removing');
                item.addEventListener('animationend', () => deleteCategory(slug), { once: true });
            }
        });
    });

    // Move category up/down
    list.querySelectorAll('[data-action="move-up"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const item = btn.closest('.category-item');
            const index = parseInt(item.dataset.index);
            if (index > 0) await moveCategory(index, index - 1);
        });
    });

    list.querySelectorAll('[data-action="move-down"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const item = btn.closest('.category-item');
            const index = parseInt(item.dataset.index);
            const cats = await getCategories();
            if (index < cats.length - 1) await moveCategory(index, index + 1);
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
            if (label) addTag(category, label);
        };

        addBtn.addEventListener('click', doAdd);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
        });
    });
}

async function addCategory(label) {
    const cats = await getCategories();
    const slug = slugify(label);
    if (!slug) return;
    if (cats.some(c => c.slug === slug)) {
        showToast('Categoria já existe!');
        return;
    }
    const { error } = await sbAdmin.from('categories').insert({
        slug, label, sort_order: cats.length,
    });
    if (error) { showToast('Erro ao criar categoria.'); return; }
    await renderCategories();
    showToast('Categoria criada!');
}

async function deleteCategory(slug) {
    await sbAdmin.from('categories').delete().eq('slug', slug);
    // Tags are deleted via CASCADE
    await renderCategories();
    showToast('Categoria deletada!');
}

async function renameCategory(index, newLabel) {
    const cats = await getCategories();
    const cat = cats[index];
    if (!cat) return;
    await sbAdmin.from('categories').update({ label: newLabel }).eq('slug', cat.slug);
    await renderCategories();
    showToast('Categoria renomeada!');
}

async function moveCategory(fromIndex, toIndex) {
    const cats = await getCategories();
    if (fromIndex < 0 || fromIndex >= cats.length || toIndex < 0 || toIndex >= cats.length) return;

    const [moved] = cats.splice(fromIndex, 1);
    cats.splice(toIndex, 0, moved);
    await saveCategories(cats);
    await renderCategories();
}

async function addTag(categorySlug, label) {
    const { error } = await sbAdmin.from('tags').insert({
        category_slug: categorySlug,
        label: label,
    });
    if (error) {
        if (error.code === '23505') showToast('Tag já existe!');
        else showToast('Erro ao criar tag.');
        return;
    }
    await renderCategories();
    const item = document.querySelector(`.category-item[data-slug="${categorySlug}"]`);
    if (item) {
        const panel = item.querySelector('.category-tags-panel');
        panel.hidden = false;
        item.classList.add('open');
    }
    showToast('Tag adicionada!');
}

async function deleteTag(categorySlug, label) {
    await sbAdmin.from('tags').delete()
        .eq('category_slug', categorySlug)
        .eq('label', label);
    await renderCategories();
    const item = document.querySelector(`.category-item[data-slug="${categorySlug}"]`);
    if (item) {
        const panel = item.querySelector('.category-tags-panel');
        panel.hidden = false;
        item.classList.add('open');
    }
    showToast('Tag removida!');
}

// Add category button
document.getElementById('add-category-btn').addEventListener('click', async () => {
    const input = document.getElementById('new-category-input');
    const label = input.value.trim();
    if (label) {
        await addCategory(label);
        input.value = '';
    }
});

document.getElementById('new-category-input').addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const label = e.target.value.trim();
        if (label) {
            await addCategory(label);
            e.target.value = '';
        }
    }
});

// ─── Appearance ───────────────────────────────────────────
async function initAppearanceForm() {
    const logo = await getLogo();
    const titleInput    = document.getElementById('appearance-title');
    const subtitleInput = document.getElementById('appearance-subtitle');
    const previewTitle  = document.getElementById('preview-title');
    const previewSub    = document.getElementById('preview-subtitle');

    titleInput.value    = logo.title;
    subtitleInput.value = logo.subtitle;
    previewTitle.textContent = logo.title;
    previewSub.textContent   = logo.subtitle;

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

document.getElementById('save-appearance-btn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const logo = {
        title:    document.getElementById('appearance-title').value.trim() || DEFAULT_LOGO.title,
        subtitle: document.getElementById('appearance-subtitle').value.trim() || DEFAULT_LOGO.subtitle,
    };
    await saveLogo(logo);

    document.title = `${logo.title} — Admin`;

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

// ─── Seeds ────────────────────────────────────────────────
async function renderCustomSeeds(query = '') {
    const allSeeds = await getCustomSeeds();
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
            <div class="admin-card-prompt">
                <p class="admin-prompt-text">
                    <span class="admin-prompt-prefix">[${seed.category.replace(/-/g, ' ').toUpperCase()}]&nbsp;</span>${seed.seed}
                </p>
                <div class="admin-card-row">
                    <span class="admin-card-meta">${seed.category}${seed.tag ? ' · ' + seed.tag : ''}</span>
                    <div class="admin-card-actions">
                        <button class="admin-card-btn admin-card-edit" data-id="${seed.id}">Editar</button>
                        <button class="admin-card-btn admin-card-delete" data-id="${seed.id}">Remover</button>
                    </div>
                </div>
            </div>
            <img src="${seed.url}" alt="" loading="lazy" class="admin-card-img">
        </div>
    `).join('');

    // Click on card image → preview
    grid.querySelectorAll('.admin-card-img').forEach(img => {
        img.addEventListener('click', async () => {
            const id   = Number(img.closest('.admin-card').dataset.id);
            const seeds = await getCustomSeeds();
            const seed = seeds.find(s => s.id === id);
            if (seed) openSeedPreview(seed);
        });
    });

    // Edit button
    grid.querySelectorAll('.admin-card-edit').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id   = Number(btn.dataset.id);
            const seeds = await getCustomSeeds();
            const seed = seeds.find(s => s.id === id);
            if (seed) await openEditSeedModal(seed);
        });
    });

    // Delete button
    grid.querySelectorAll('.admin-card-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Remover esta seed?')) {
                await deleteCustomSeed(Number(btn.dataset.id));
            }
        });
    });
}

async function deleteCustomSeed(id) {
    // Also delete the image from storage if it's a supabase URL
    const seeds = await getCustomSeeds();
    const seed = seeds.find(s => s.id === id);
    if (seed && seed.url && seed.url.includes('sb.co/storage')) {
        const path = seed.url.split('/seed-images/')[1];
        if (path) await sbAdmin.storage.from('seed-images').remove([path]);
    }
    await deleteSeed(id);
    await renderCustomSeeds(document.getElementById('seeds-search').value);
    showToast('Seed removida!');
}

// ─── Seed Preview Modal ───────────────────────────────────
function openSeedPreview(seed) {
    document.getElementById('preview-modal-title').textContent  = seed.title || '';
    document.getElementById('preview-modal-img').src            = seed.url;
    document.getElementById('preview-modal-img').alt            = seed.title || '';
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

// ─── Edit Seed Modal ──────────────────────────────────────
const adminEditModal     = document.getElementById('admin-edit-modal');
const adminEditSeedForm  = document.getElementById('admin-edit-seed-form');
const editFormCat        = document.getElementById('edit-form-category');
const editFormTag        = document.getElementById('edit-form-tag');
const editFormTagGrp     = document.getElementById('edit-form-tag-group');

async function openEditSeedModal(seed) {
    const categories = await getCategories();
    const allTags    = await getAllTags();
    document.getElementById('edit-form-id').value   = seed.id;
    document.getElementById('edit-form-seed').value = seed.seed;

    editFormCat.innerHTML = '<option value="" disabled>Selecione...</option>' +
        categories.map(c => `<option value="${c.slug}"${c.slug === seed.category ? ' selected' : ''}>${c.label}</option>`).join('');

    const tags = allTags[seed.category] || [];
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

editFormCat.addEventListener('change', async () => {
    const allTags = await getAllTags();
    const tags = allTags[editFormCat.value] || [];
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

adminEditSeedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = Number(document.getElementById('edit-form-id').value);

    try {
        await updateSeed(id, {
            category: editFormCat.value,
            tag:      editFormTag.value || null,
            seed:     document.getElementById('edit-form-seed').value.trim(),
        });
        closeEditSeedModal();
        await renderCustomSeeds(document.getElementById('seeds-search').value);
        showToast('Seed atualizada!');
    } catch (err) {
        showToast('Erro ao atualizar seed.');
    }
});

// ─── Export / Import ──────────────────────────────────────
document.getElementById('export-seeds-btn').addEventListener('click', async () => {
    const backup = {
        version:    2,
        exportedAt: new Date().toISOString(),
        categories: await getCategories(),
        tags:       await getAllTags(),
        logo:       await getLogo(),
        seeds:      await getCustomSeeds(),
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

// ─── Restore Backup (JSON) ────────────────────────────────
document.getElementById('restore-backup-btn').addEventListener('click', () => {
    document.getElementById('restore-file-input').click();
});

document.getElementById('restore-file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    let backup;
    try {
        backup = JSON.parse(await file.text());
    } catch {
        showToast('Arquivo JSON inválido!');
        return;
    }

    if (!backup.version || !Array.isArray(backup.seeds)) {
        showToast('Formato de backup inválido!');
        return;
    }

    const dateStr = backup.exportedAt ? backup.exportedAt.slice(0, 10) : 'data desconhecida';
    if (!confirm(`Restaurar backup de ${dateStr}?\n\nIsso substituirá categorias, tags, aparência e seeds atuais.`)) return;

    // Restore categories
    if (Array.isArray(backup.categories)) {
        await saveCategories(backup.categories);
    }

    // Restore tags
    if (backup.tags && typeof backup.tags === 'object') {
        for (const [catSlug, tagList] of Object.entries(backup.tags)) {
            for (const label of tagList) {
                await sbAdmin.from('tags').upsert(
                    { category_slug: catSlug, label },
                    { onConflict: 'category_slug,label' }
                );
            }
        }
    }

    // Restore logo
    if (backup.logo && backup.logo.title) {
        await saveLogo(backup.logo);
    }

    // Restore seeds
    if (Array.isArray(backup.seeds)) {
        for (const seed of backup.seeds) {
            await sbAdmin.from('seeds').upsert({
                seed: seed.seed,
                url: seed.url,
                title: seed.title || '',
                category: seed.category,
                tag: seed.tag || '',
            });
        }
    }

    await initAdmin();
    showToast(`Backup restaurado! ${backup.seeds.length} seed(s).`);
});

// ─── Import Images ─────────────────────────────────────────
let pendingImports = [];

document.getElementById('import-seeds-btn').addEventListener('click', () => {
    document.getElementById('import-file-input').click();
});

document.getElementById('import-file-input').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';
    await openImportModal(files);
});

async function openImportModal(files) {
    const modal = document.getElementById('admin-import-modal');
    const list  = document.getElementById('import-images-list');
    list.innerHTML = '<div style="padding:1rem;color:#666;font-size:0.85rem">Processando imagens…</div>';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const cats = await getCategories();
    const catOptions = cats.map(c => `<option value="${c.slug}">${c.label}</option>`).join('');

    // Store raw files for Supabase upload
    pendingImports = files.map(f => ({ file: f, name: f.name }));

    // Create preview URLs
    const previewUrls = files.map(f => URL.createObjectURL(f));

    list.innerHTML = pendingImports.map((item, i) => `
        <div class="import-item" data-index="${i}">
            <img src="${previewUrls[i]}" class="import-item-thumb" alt="">
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
        select.addEventListener('change', async () => {
            const item   = select.closest('.import-item');
            const tagGrp = item.querySelector('.import-tag-group');
            const tagSel = item.querySelector('.import-tag-select');
            const allTags = await getAllTags();
            const tags   = allTags[select.value] || [];
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

document.getElementById('save-import-btn').addEventListener('click', async () => {
    const items  = document.querySelectorAll('.import-item');
    const saveBtn = document.getElementById('save-import-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';
    let saved = 0;

    for (let i = 0; i < items.length; i++) {
        const item    = items[i];
        const catSel  = item.querySelector('.import-cat-select');
        const tagSel  = item.querySelector('.import-tag-select');
        const seedInp = item.querySelector('.import-seed-input');
        if (!catSel.value) continue;

        try {
            const file = pendingImports[i].file;
            const imageUrl = await uploadImageToStorage(file);
            if (!imageUrl) continue;

            const seedText = seedInp.value.trim();
            await saveNewSeed({
                title:    seedText.split(' ').slice(0, 4).join(' ') || 'seed',
                category: catSel.value,
                tag:      tagSel.value || null,
                url:      imageUrl,
                seed:     seedText,
            });
            saved++;
        } catch (err) {
            console.error('Import error:', err);
        }
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Salvar tudo';

    if (saved === 0) { showToast('Selecione ao menos uma categoria!'); return; }

    closeImportModal();
    await renderCustomSeeds();
    showToast(`${saved} imagem(ns) importada(s)!`);
});

// ─── Seeds Search ─────────────────────────────────────────
document.getElementById('seeds-search').addEventListener('input', (e) => {
    renderCustomSeeds(e.target.value);
});

// ─── Add Seed Modal ───────────────────────────────────────
const adminAddModal    = document.getElementById('admin-add-modal');
const adminAddSeedForm = document.getElementById('admin-add-seed-form');
const adminFormImage   = document.getElementById('admin-form-image');
const adminImgPreview  = document.getElementById('admin-img-preview');
const adminFormCat     = document.getElementById('admin-form-category');
const adminFormTag     = document.getElementById('admin-form-tag');
const adminFormTagGrp  = document.getElementById('admin-form-tag-group');

async function openAddSeedModal() {
    const categories = await getCategories();
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

adminFormCat.addEventListener('change', async () => {
    const allTags = await getAllTags();
    const tags = allTags[adminFormCat.value] || [];
    if (tags.length > 0) {
        adminFormTag.innerHTML = '<option value="">Sem tag</option>' +
            tags.map(t => `<option value="${t.toLowerCase()}">${t}</option>`).join('');
        adminFormTagGrp.style.display = 'flex';
    } else {
        adminFormTagGrp.style.display = 'none';
    }
});

// ─── Upload Image to Supabase Storage ─────────────────────
async function uploadImageToStorage(file) {
    const ext      = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path     = `seeds/${filename}`;

    const { error } = await sbAdmin.storage
        .from('seed-images')
        .upload(path, file, {
            cacheControl: '31536000',
            upsert: false,
        });

    if (error) {
        console.error('Upload error:', error);
        return null;
    }

    const { data: { publicUrl } } = sbAdmin.storage
        .from('seed-images')
        .getPublicUrl(path);

    return publicUrl;
}

// ─── Image preview ────────────────────────────────────────
adminFormImage.addEventListener('change', () => {
    const file = adminFormImage.files[0];
    if (!file) { adminImgPreview.innerHTML = ''; return; }
    const url = URL.createObjectURL(file);
    adminImgPreview.innerHTML = `<img src="${url}" alt="preview">`;
});

adminAddSeedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file      = adminFormImage.files[0];
    const submitBtn = e.target.querySelector('[type="submit"]');
    if (!file) return;

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Enviando...';

    try {
        const imageUrl = await uploadImageToStorage(file);
        if (!imageUrl) {
            showToast('Erro ao enviar imagem.');
            return;
        }

        const tagVal   = adminFormTag.value;
        const seedText = document.getElementById('admin-form-seed').value.trim();

        await saveNewSeed({
            title:    seedText.split(' ').slice(0, 4).join(' ') || 'seed',
            category: adminFormCat.value,
            tag:      tagVal || null,
            url:      imageUrl,
            seed:     seedText,
        });

        closeAddSeedModal();
        await renderCustomSeeds();
        showToast('Seed adicionada!');
    } catch (err) {
        showToast('Erro ao salvar seed.');
        console.error(err);
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

// ─── Toast ────────────────────────────────────────────────
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

// ─── Init ─────────────────────────────────────────────────
checkAuth();
