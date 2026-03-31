# Supabase Migration Plan -- Biblioteca de Seeds

## Overview

This plan migrates the "Biblioteca de Seeds" project from a localStorage-based static site to a Supabase-backed architecture (database, storage, auth) while remaining hosted on GitHub Pages.

---

## Phase 0: Supabase Project Setup (Manual Steps)

The user must complete these steps in the Supabase dashboard before any code changes begin.

### 0.1 Create Supabase Project
1. Go to https://supabase.com and create a free account (or sign in).
2. Click "New project". Choose a name (e.g., `seed-library`), set a database password, select a region close to your users (e.g., South America East if most users are Brazilian).
3. Wait for the project to provision (~2 minutes).
4. Note two values from **Settings > API**:
   - `SUPABASE_URL` (e.g., `https://xxxx.supabase.co`)
   - `SUPABASE_ANON_KEY` (the public `anon` key -- safe to embed in client code)

### 0.2 Create Database Tables

Run this SQL in the Supabase **SQL Editor**:

```sql
-- Seeds table: replaces localStorage 'seedlibrary_custom'
CREATE TABLE seeds (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title       TEXT NOT NULL DEFAULT 'seed',
  seed        TEXT NOT NULL,                    -- the Midjourney prompt
  url         TEXT NOT NULL,                    -- Supabase Storage public URL
  category    TEXT NOT NULL,                    -- e.g. 'ilustracao', 'fotografia-3d'
  tag         TEXT,                             -- e.g. 'anime', 'fantasia'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories table: replaces localStorage 'sl_categories'
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  label       TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0
);

-- Tags table: replaces localStorage 'sl_tags'
CREATE TABLE tags (
  id          SERIAL PRIMARY KEY,
  category_slug TEXT NOT NULL REFERENCES categories(slug) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  UNIQUE(category_slug, label)
);

-- Site settings: replaces localStorage 'sl_logo'
CREATE TABLE site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Insert defaults
INSERT INTO categories (slug, label, sort_order) VALUES
  ('ilustracao',      'Ilustração',      0),
  ('pintura',         'Pintura',         1),
  ('cinematografico', 'Cinematográfico', 2),
  ('fotografia',      'Fotografia',      3);

INSERT INTO tags (category_slug, label) VALUES
  ('ilustracao', 'Anime'), ('ilustracao', 'Fantasia'), ('ilustracao', 'Sci-Fi'), ('ilustracao', 'Retrato'),
  ('pintura', 'Aquarela'), ('pintura', 'Óleo'), ('pintura', 'Digital'), ('pintura', 'Acrílico'),
  ('cinematografico', 'Noir'), ('cinematografico', 'Sci-Fi'), ('cinematografico', 'Drama'), ('cinematografico', 'Terror'),
  ('fotografia', '3D'), ('fotografia', 'Abstrata'), ('fotografia', 'Rêtro'), ('fotografia', 'Estilizada');

INSERT INTO site_settings (key, value) VALUES
  ('logo', '{"title": "Seed Library", "subtitle": "Descubra e copie prompts incríveis."}');
```

### 0.3 Set Up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: anyone can view seeds, categories, tags, settings
CREATE POLICY "Public read seeds"      ON seeds         FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories    FOR SELECT USING (true);
CREATE POLICY "Public read tags"       ON tags          FOR SELECT USING (true);
CREATE POLICY "Public read settings"   ON site_settings FOR SELECT USING (true);

-- ADMIN WRITE: only authenticated users can insert/update/delete
CREATE POLICY "Admin insert seeds"     ON seeds         FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update seeds"     ON seeds         FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete seeds"     ON seeds         FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert categories" ON categories   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update categories" ON categories   FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete categories" ON categories   FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert tags"      ON tags          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update tags"      ON tags          FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete tags"      ON tags          FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update settings"  ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin insert settings"  ON site_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 0.4 Create Storage Bucket

```sql
-- Create a public bucket for seed images
INSERT INTO storage.buckets (id, name, public) VALUES ('seed-images', 'seed-images', true);

-- Allow public reads
CREATE POLICY "Public read seed images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'seed-images');

-- Allow authenticated uploads
CREATE POLICY "Admin upload seed images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'seed-images' AND auth.role() = 'authenticated');

-- Allow authenticated deletes
CREATE POLICY "Admin delete seed images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'seed-images' AND auth.role() = 'authenticated');
```

### 0.5 Create Admin User

In the Supabase dashboard go to **Authentication > Users > Add user**. Create a user with email and password. This replaces the hardcoded SHA-256 hash authentication.

---

## Phase 1: New Shared Configuration File

### 1.1 Create `supabase-config.js` (NEW FILE)

This file is loaded by `index.html`, `admin.html`, and `gallery.html` via a `<script>` tag BEFORE their respective JS files. It sets up the Supabase client using the CDN.

Purpose: single source of truth for the Supabase client instance.

```
Location: /supabase-config.js (project root)
```

Contents will:
1. Import Supabase JS v2 from CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js`
2. Initialize the client with SUPABASE_URL and SUPABASE_ANON_KEY
3. Expose `window.supabase` for other scripts to use

Key considerations:
- The anon key is safe to expose in client code; RLS protects the data.
- The CDN script tag must appear BEFORE main.js/admin.js/gallery.js in each HTML file.

---

## Phase 2: Code Changes (File by File)

### 2.1 `index.html`

Changes needed:
- Add Supabase CDN script tag before `main.js`
- Add `supabase-config.js` script tag after the CDN script

Current (line 124):
```html
<script src="main.js"></script>
```

New:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="supabase-config.js"></script>
<script src="main.js"></script>
```

### 2.2 `main.js`

This is the largest change. Every localStorage read must become a Supabase query.

**Functions to rewrite:**

| Current Function | Current Behavior | New Behavior |
|---|---|---|
| `loadAllSeeds()` | `JSON.parse(localStorage.getItem('seedlibrary_custom'))` | `supabase.from('seeds').select('*')` |
| `getCategories()` | `JSON.parse(localStorage.getItem('sl_categories'))` | `supabase.from('categories').select('*').order('sort_order')` |
| `getAllTags()` | `JSON.parse(localStorage.getItem('sl_tags'))` | `supabase.from('tags').select('*')` then group by `category_slug` |
| `getLogo()` | `JSON.parse(localStorage.getItem('sl_logo'))` | `supabase.from('site_settings').select('value').eq('key','logo').single()` |
| `getFavorites()` | `JSON.parse(localStorage.getItem('sl_favorites'))` | **Keep in localStorage** -- favorites are per-user/browser, not shared data |
| `getSeenCounts()` | `JSON.parse(localStorage.getItem('sl_seen_counts'))` | **Keep in localStorage** -- per-browser UI state |

**Key architectural decisions for main.js:**

1. **Make `init()` async.** The function must `await` Supabase queries before rendering.
2. **Cache Supabase data in memory variables** (like `_seedsCache` already does). This avoids repeated network calls when filtering/searching. Only re-fetch on explicit refresh.
3. **The `storage` event listener (line 554-572) should be removed** since cross-tab sync via localStorage is no longer relevant for seeds/categories/tags. Favorites and seen counts can remain.
4. **Keep `shuffle()` logic** -- just shuffle the data after fetching from Supabase.
5. **Image URLs change**: Currently `item.url` can be a `data:base64` string or a relative path. After migration, all URLs will be Supabase Storage public URLs (format: `https://xxxx.supabase.co/storage/v1/object/public/seed-images/filename.jpg`).
6. **The download function (line 387-426)** must handle cross-origin Supabase URLs. The existing `fetch` + blob approach already works for external URLs, so this should function without changes.

**Detailed rewrite approach for main.js:**

- Add an async `fetchData()` function at the top that fetches seeds, categories, tags, and logo in parallel using `Promise.all`.
- Store results in module-level variables: `_categories`, `_allTags`, `_logo`, `_seedsCache`.
- All existing functions (`getCategories`, `getAllTags`, `getLogo`, `loadAllSeeds`) become synchronous getters that return from the cached variables.
- `init()` calls `await fetchData()` first, then proceeds as before.
- Remove the `applyMigrations()` function (line 586-592) -- no longer needed.
- Remove the `storage` event listener for SEEDS, CATEGORIES, TAGS, and LOGO keys.

### 2.3 `admin.html`

Changes needed:
- Add Supabase CDN + config script tags before `admin.js`

Current (implied from structure): `<script src="admin.js"></script>` at the end.

New:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="supabase-config.js"></script>
<script src="admin.js"></script>
```

### 2.4 `admin.js` -- LARGEST REWRITE

**Auth replacement (lines 63-109):**

Current: SHA-256 hash comparison with hardcoded `PASS_HASH`, stores `sl_auth` in sessionStorage.

New:
- Replace with `supabase.auth.signInWithPassword({ email, password })`.
- Replace `checkAuth()` with `supabase.auth.getSession()` to check for existing session.
- Replace `sessionStorage.getItem('sl_auth')` checks with Supabase session checks.
- The login form stays visually the same. Change the username field to an email field.
- `logout` calls `supabase.auth.signOut()`.

Remove:
- `ADMIN_USER` constant (line 64)
- `PASS_HASH` constant (line 66)
- `hashStr()` function (lines 68-71)

**CRUD operations replacement:**

| Current Function | New Behavior |
|---|---|
| `getCustomSeeds()` | `supabase.from('seeds').select('*')` |
| `saveCustomSeeds(seeds)` | Not needed -- individual inserts/updates/deletes instead |
| `getCategories()` | `supabase.from('categories').select('*').order('sort_order')` |
| `saveCategories(cats)` | Individual `supabase.from('categories').upsert(...)` |
| `getAllTags()` | `supabase.from('tags').select('*')` |
| `saveTags(tags)` | Individual `supabase.from('tags').insert(...)` / `.delete(...)` |
| `getLogo()` | `supabase.from('site_settings').select('value').eq('key','logo').single()` |
| `saveLogo(logo)` | `supabase.from('site_settings').upsert({ key: 'logo', value: logo })` |

**Seed add/import -- image upload change (lines 877-970):**

Current flow: `compressImage(file)` returns a `data:` base64 URL, which is stored directly in localStorage as `seed.url`.

New flow:
1. `compressImage(file)` still runs (keep client-side compression to reduce upload size).
2. Convert the data URL to a Blob.
3. Upload to Supabase Storage: `supabase.storage.from('seed-images').upload(path, blob)`.
4. Get the public URL: `supabase.storage.from('seed-images').getPublicUrl(path)`.
5. Store the public URL as `seed.url` in the `seeds` table.

The file path in storage should use a pattern like: `{category}/{timestamp}-{sanitized-name}.jpg`.

**Storage bar (lines 111-122, 897-908):**
- Remove `storageUsedPercent()` and `updateStorageBar()` -- localStorage quota tracking is no longer relevant.
- Could replace with a Supabase Storage usage indicator, but this is optional for the initial migration.

**Export/Import (lines 641-821):**
- `export-seeds-btn`: Change to fetch all data from Supabase tables and create the JSON backup. Same JSON format, but seed URLs will now be Supabase URLs.
- `restore-backup-btn`: Must upload images from the backup to Supabase Storage if they contain `data:` URLs, then insert rows into the database.
- `import-seeds-btn` / `openImportModal`: Change the save flow to upload images to Supabase Storage first, then insert seed rows.

### 2.5 `gallery.html`

Add the same two script tags before `gallery.js`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="supabase-config.js"></script>
<script src="gallery.js"></script>
```

### 2.6 `gallery.js`

Same pattern as `main.js`:
- Replace `loadSeeds()` (line 42-44) with async Supabase query.
- Replace `getCategories()` (line 37-39) with Supabase query.
- Keep `loadFavs()` and `saveFavs()` in localStorage (per-browser state).
- Make `init()` (at bottom of file) async.
- The storage bar component in gallery.html sidebar (lines 40-45) should either be removed or repurposed.

### 2.7 `sw.js` (Service Worker)

Update the service worker to:
- Remove image caching for Supabase URLs (or add them to a runtime cache with network-first strategy).
- Bump `CACHE_NAME` to `'seed-library-v2'` to force cache invalidation.
- Add `supabase-config.js` to the `PRECACHE` list.

### 2.8 `app/src/data/mockData.js` (React App)

This file currently uses Unsplash placeholder URLs. After migration, this should either:
- Import the Supabase client and query the `seeds` table directly, OR
- Be updated to reference the Supabase Storage URLs.

Since the React app has its own build step (Vite), it can install `@supabase/supabase-js` via npm.

---

## Phase 3: Image Upload Strategy

### 3.1 Migrating Existing Images from `./Imagens/`

There are 64 image files (~217MB) in the `Imagens/` directory. These need to be uploaded to the `seed-images` Supabase Storage bucket.

**Recommended approach: Node.js migration script**

Create a one-time `migrate-images.mjs` script (not committed, run locally) that:

1. Reads all files from `./Imagens/`.
2. For each file, uploads to `supabase.storage.from('seed-images').upload('imagens/{filename}', fileBuffer)`.
3. Retrieves the public URL.
4. Outputs a mapping JSON: `{ "original_filename": "public_url" }`.

This script requires the Supabase service role key (from Settings > API > service_role) to bypass RLS.

### 3.2 Migrating Existing localStorage Seeds

The user's existing seed data lives in their browser's localStorage. A separate migration step is needed:

1. In the admin panel, add a temporary "Migrate to Supabase" button.
2. When clicked, it reads `localStorage.getItem('seedlibrary_custom')`, parses the JSON.
3. For each seed:
   - If `seed.url` starts with `data:base64`, convert to Blob, upload to Supabase Storage, get public URL.
   - If `seed.url` is a relative path (e.g., `Imagens/foo.jpg`), look up the already-migrated public URL from the mapping in step 3.1.
   - Insert the seed row into the `seeds` table with the new URL.
4. After successful migration, show a confirmation.

### 3.3 Upload Size Limits

Supabase free tier allows files up to 50MB per upload. The largest seed images are ~5-8MB, well within limits. The `compressImage()` function in admin.js already compresses to JPEG quality 0.82 at max 1200px dimension, keeping file sizes reasonable for new uploads.

---

## Phase 4: Files and Directories to Delete from Git Repo

After all images are migrated to Supabase Storage and verified, remove these from the repository:

### Definitely Remove (seed images -- 217MB):
- `Imagens/` -- entire directory (64 files, ~217MB)

### Evaluate for Removal (non-seed assets):
These are NOT seed images. They are documentation/report assets used by markdown files. They should only be removed if you also plan to host them on Supabase. Otherwise, keep them since they serve a different purpose.

- `!/` directory -- SVG tags and presentation assets for the best-practice docs
- `best-practice/assets/` -- documentation images (1 JPG)
- `reports/assets/` -- report diagrams (2 PNG, 2 SVG)
- `development-workflows/cross-model-workflow/assets/` -- workflow diagram
- `current-page.png`, `legacy-components.png` -- likely temporary/debug screenshots, safe to remove

### Definitely Keep:
- `favicon.svg` -- site icon
- `app/src/assets/react.svg` -- React app asset
- `app/public/vite.svg` -- Vite default asset

### Git History Consideration
Simply deleting the `Imagens/` folder from the repo will not reduce the `.git` history size. The 217MB will remain in Git history. To truly clean the repo:

Option A (simple): Just delete the folder and accept the bloated history.
Option B (thorough): Use `git filter-repo` or BFG Repo Cleaner to rewrite history and remove all traces of the image files. This requires force-pushing and all collaborators re-cloning.

---

## Phase 5: Migration Execution Order

This is the recommended sequence to migrate without breaking the live site:

### Step 1: Supabase Setup (Phase 0)
- Create project, run SQL, create bucket, create admin user.
- Estimated time: 30 minutes.

### Step 2: Upload Existing Images (Phase 3.1)
- Run the Node.js migration script to upload `Imagens/` files to Supabase Storage.
- Save the filename-to-URL mapping.
- Estimated time: 15-30 minutes depending on upload speed.

### Step 3: Create `supabase-config.js` (Phase 1)
- Single new file.
- Does not affect existing functionality (nothing uses it yet).

### Step 4: Modify `main.js` (Phase 2.2)
- Replace localStorage reads with Supabase queries.
- Test the public gallery works with Supabase data.
- At this point the gallery will be empty (no seeds in DB yet), but the code path is correct.

### Step 5: Modify `admin.js` (Phase 2.4)
- Replace auth, CRUD, and image upload.
- This is the most complex change.
- Test: log in, add a seed, verify it appears.

### Step 6: Migrate localStorage Data (Phase 3.2)
- Use the temporary migration button in admin to push existing localStorage seeds to Supabase.
- Verify all seeds appear correctly in the gallery.

### Step 7: Modify `gallery.js` (Phase 2.6)
- Same pattern as main.js changes.

### Step 8: Update HTML files (Phase 2.1, 2.3, 2.5)
- Add CDN script tags.

### Step 9: Update `sw.js` (Phase 2.7)
- Bump cache version, add config file to precache.

### Step 10: Delete Images from Repo (Phase 4)
- Remove `Imagens/` directory.
- Remove any other confirmed-deletable assets.
- Commit and push.

### Step 11: Verification (Phase 6)

---

## Phase 6: Verification Checklist

### Public Gallery (index.html)
- [ ] Page loads and shows all seeds from Supabase
- [ ] Category filters work (sidebar buttons)
- [ ] Tag filters work within categories
- [ ] Search works
- [ ] Lightbox opens with correct image and prompt
- [ ] Copy Seed button works
- [ ] Download button works (cross-origin Supabase URLs)
- [ ] Favorites toggle works (still localStorage)
- [ ] Share link with hash (#seed-123) works
- [ ] Mobile/touch navigation works

### Admin Panel (admin.html)
- [ ] Login works with Supabase Auth (email/password)
- [ ] Logout works
- [ ] Session persists on page refresh
- [ ] Add seed: image uploads to Supabase Storage, row inserts to DB
- [ ] Edit seed: prompt/category/tag update correctly
- [ ] Delete seed: row removed, image optionally deleted from storage
- [ ] Categories: add, rename, reorder, delete all work
- [ ] Tags: add and delete work
- [ ] Appearance: logo title/subtitle save and reflect on public site
- [ ] Export backup: downloads JSON with Supabase URLs
- [ ] Import images: uploads to Storage, inserts to DB
- [ ] Restore backup: correctly processes the JSON

### Gallery Page (gallery.html)
- [ ] Seeds load from Supabase
- [ ] Category navigation works
- [ ] Search works
- [ ] Lightbox works
- [ ] Favorites work (localStorage)

### React App (app/)
- [ ] If updated, seeds load from Supabase
- [ ] Images display correctly from Supabase Storage URLs

### Performance
- [ ] Initial page load is acceptable (Supabase query latency)
- [ ] Images load from Supabase CDN without excessive delay
- [ ] Service worker caches appropriately

### Security
- [ ] Anonymous users cannot insert/update/delete seeds
- [ ] Anonymous users cannot upload to storage
- [ ] Supabase anon key is used (not service_role key) in client code
- [ ] Admin user password is not exposed in source code

---

## Risk Assessment and Mitigations

### Risk 1: Supabase Latency on First Load
The current site loads instantly from localStorage. Supabase queries add network latency.

**Mitigation:** Add a loading skeleton/spinner to `index.html` main content area. Fetch all data in a single `Promise.all` call. Consider Supabase Edge Functions or caching headers.

### Risk 2: localStorage Data Loss During Migration
If the user clears their browser before migrating localStorage seeds to Supabase, the data is lost.

**Mitigation:** The export/backup feature already exists. Instruct the user to export a JSON backup BEFORE starting migration. The backup file can be imported into Supabase.

### Risk 3: Supabase Free Tier Limits
Free tier: 500MB database, 1GB storage, 2GB bandwidth/month.

**Mitigation:** 217MB of images fits within 1GB storage. Compressed uploads (~JPEG 0.82) keep sizes manageable. Monitor bandwidth usage. The site is likely low-traffic.

### Risk 4: Cross-Origin Image Loading
Supabase Storage URLs are on a different domain than GitHub Pages.

**Mitigation:** Supabase Storage buckets marked as `public` serve images with proper CORS headers. The existing download code already handles cross-origin fetch.

### Risk 5: Breaking the Live Site During Migration
GitHub Pages deploys on push. Partial changes could break the site.

**Mitigation:** Do all code changes in a branch. Test locally. Merge to main only when everything works. The HTML files without the Supabase CDN script tags will fail gracefully (Supabase client undefined), but it is best to deploy all changes atomically.

---

## Summary of Files Changed

| File | Action | Complexity |
|---|---|---|
| `supabase-config.js` | **CREATE** | Low |
| `index.html` | Add 2 script tags | Low |
| `admin.html` | Add 2 script tags, change username to email field | Low |
| `gallery.html` | Add 2 script tags | Low |
| `main.js` | Rewrite data fetching (async), remove localStorage for seeds/categories/tags | **High** |
| `admin.js` | Replace auth, replace all CRUD, replace image upload flow | **Very High** |
| `gallery.js` | Rewrite data fetching (async), same pattern as main.js | **Medium** |
| `sw.js` | Bump cache, add config to precache | Low |
| `Imagens/` | **DELETE** entire directory | Low (but large) |
| `migrate-images.mjs` | **CREATE** (temporary, not committed) | Medium |
