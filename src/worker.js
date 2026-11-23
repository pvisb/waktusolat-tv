// Handles /api/config only. Everything else is served as static files from /public.
const H = { "content-type": "application/json", "cache-control": "no-store" };
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/config") return env.ASSETS.fetch(request);

    if (request.method === "GET") {
      const v = env.TV_KV ? await env.TV_KV.get("config") : null;
      return new Response(v || "{}", { headers: H });
    }
    if (request.method === "PUT") {
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
    return new Response("Method not allowed", { status: 405 });
  },
};
