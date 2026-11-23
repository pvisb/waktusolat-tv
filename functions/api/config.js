// GET  /api/config -> public settings for the TV
// PUT  /api/config -> save settings (needs header x-admin-password)
const H = { "content-type": "application/json", "cache-control": "no-store" };
export async function onRequestGet({ env }) {
  const v = env.TV_KV ? await env.TV_KV.get("config") : null;
  return new Response(v || "{}", { headers: H });
}
export async function onRequestPut({ request, env }) {
  if (!env.ADMIN_PASSWORD || request.headers.get("x-admin-password") !== env.ADMIN_PASSWORD)
    return new Response('{"error":"Kata laluan salah"}', { status: 401, headers: H });
  if (!env.TV_KV) return new Response('{"error":"KV belum disambung"}', { status: 500, headers: H });
  const b = await request.json();
  const clean = {
    slogan: [String(b.slogan?.[0] || "").slice(0, 80), String(b.slogan?.[1] || "").slice(0, 80)],
    announcements: (b.announcements || []).map(x => String(x).slice(0, 300)).slice(0, 10),
    ticker: (b.ticker || []).map(x => String(x).slice(0, 200)).slice(0, 20),
    images: (b.images || []).map(x => String(x).slice(0, 300)).slice(0, 20),
  };
  await env.TV_KV.put("config", JSON.stringify(clean));
  return new Response('{"ok":true}', { headers: H });
}
