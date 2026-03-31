# Plano: Migração Completa para Supabase

## Contexto
O projeto "Seed Library" é um site estático (GitHub Pages) que armazena tudo em localStorage e tem ~62 imagens (~217MB) no repositório Git. A usuária quer migrar para Supabase (Storage + Database + Auth) para poder adicionar muitas imagens sem inchar o repositório, e remover TODAS as imagens do Git.

---

## Passo 1 — Usuária cria o projeto Supabase (manual)
A usuária precisa fazer no dashboard do Supabase:
1. Criar projeto em https://supabase.com/dashboard
2. Anotar a **URL** e **anon key** (Settings > API)
3. Criar um usuário admin: Authentication > Users > "Add user" (email + senha)

## Passo 2 — Criar schema no banco (SQL via dashboard)
Executar no SQL Editor do Supabase:

```sql
-- Tabela de seeds
CREATE TABLE seeds (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  seed TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT DEFAULT '',
  category TEXT NOT NULL,
  tag TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de categorias
CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Tabela de tags
CREATE TABLE tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_slug TEXT NOT NULL REFERENCES categories(slug) ON DELETE CASCADE,
  label TEXT NOT NULL,
  UNIQUE(category_slug, label)
);

-- Configuração de branding
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- RLS: leitura pública, escrita só autenticado
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON seeds FOR SELECT USING (true);
CREATE POLICY "Auth write" ON seeds FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Auth write" ON categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON tags FOR SELECT USING (true);
CREATE POLICY "Auth write" ON tags FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON settings FOR SELECT USING (true);
CREATE POLICY "Auth write" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Inserir categorias padrão
INSERT INTO categories (slug, label, sort_order) VALUES
  ('ilustracao', 'Ilustração', 0),
  ('pintura', 'Pintura', 1),
  ('cinematografico', 'Cinematográfico', 2),
  ('fotografia', 'Fotografia', 3);

-- Inserir logo padrão
INSERT INTO settings (key, value) VALUES
  ('logo', '{"title":"Seed Library","subtitle":"Descubra e copie prompts incríveis."}');
```

## Passo 3 — Criar bucket no Storage
No dashboard: Storage > "New bucket" chamado `seed-images`, marcar como **público**.

## Passo 4 — Criar `supabase-config.js` (novo arquivo)
Arquivo compartilhado com o client Supabase, importado por todas as páginas HTML.

```js
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'sua-anon-key';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

## Passo 5 — Modificar arquivos HTML
Adicionar em `index.html`, `admin.html`, `gallery.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
```

## Passo 6 — Reescrever `main.js`
**Mudanças-chave:**
- `loadAllSeeds()` → `async`, faz `supabase.from('seeds').select('*')`
- `getCategories()` → `async`, faz `supabase.from('categories').select('*').order('sort_order')`
- `getAllTags()` → `async`, faz `supabase.from('tags').select('*')`
- `getLogo()` → `async`, faz `supabase.from('settings').select('value').eq('key', 'logo')`
- `init()` → `async`, aguarda todas as queries
- Favoritos e seen-counts **permanecem em localStorage** (são dados do browser)
- Todas as funções de render que chamam essas funções precisam ser `async`

## Passo 7 — Reescrever `admin.js`
**Mudanças-chave:**
- Auth: trocar SHA-256 por `supabase.auth.signInWithPassword({ email, password })`
- Login form: campo `email` em vez de `username`
- CRUD de seeds: `supabase.from('seeds').insert/update/delete`
- CRUD de categorias: `supabase.from('categories').insert/update/delete`
- CRUD de tags: `supabase.from('tags').insert/update/delete`
- Upload de imagem: `supabase.storage.from('seed-images').upload(path, file)` → retorna URL pública
- Remover `storageUsedPercent()` (não há mais limite de localStorage)
- Logo/settings: `supabase.from('settings').upsert`

## Passo 8 — Reescrever `gallery.js`
Mesma lógica do `main.js` — trocar leituras de localStorage por queries Supabase async.

## Passo 9 — Remover imagens do repositório Git
(Imagens serão adicionadas manualmente pelo dashboard do Supabase)
Deletar:
- `Imagens/` — 62 imagens de seeds (~217MB)
- `best-practice/assets/` — imagens de referência de docs
- `reports/assets/` — screenshots de reports
- `tips/assets/` — webp de tips
- `current-page.png`, `legacy-components.png`

**Manter**: `favicon.svg`, `!/claude-jumping.svg`, `!/tags/*.svg` (são assets de UI, não seeds)

---

## Arquivos a modificar
| Arquivo | Ação |
|---------|------|
| `supabase-config.js` | **CRIAR** — client Supabase |
| `index.html` | Adicionar scripts CDN |
| `admin.html` | Adicionar scripts CDN + mudar campo login |
| `gallery.html` | Adicionar scripts CDN |
| `main.js` | Reescrever data layer (localStorage → Supabase) |
| `admin.js` | Reescrever auth + CRUD + upload |
| `gallery.js` | Reescrever data layer |
| `Imagens/` | **DELETAR** |
| `best-practice/assets/` | **DELETAR** |
| `reports/assets/` | **DELETAR** |
| `tips/assets/` | **DELETAR** |

## Verificação
1. Abrir `index.html` local → galeria carrega seeds do Supabase
2. Abrir `admin.html` → login com email/senha via Supabase Auth
3. Criar seed no admin → aparece na galeria com imagem do Storage
4. Upload de imagem no admin → vai pro bucket `seed-images`
5. Verificar que nenhuma imagem `.png/.jpg/.webp` pesada existe no repo
