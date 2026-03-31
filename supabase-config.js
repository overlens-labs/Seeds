// ─── Supabase Client ──────────────────────────────────────
// Shared across index.html, admin.html, gallery.html
const SUPABASE_URL      = 'https://zewsatkaxdxrrgugympx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_60OI21Jl5sbJzG1SjgBJ7A_pHUWps4Y';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
