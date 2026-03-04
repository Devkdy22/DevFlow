export interface Env {
  ASSETS: Fetcher;
}

function isHtmlNavigationRequest(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve static assets first.
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) return assetResponse;

    // SPA fallback: for navigations, return index.html so client-side routing works.
    if (!isHtmlNavigationRequest(request)) return assetResponse;

    const indexRequest = new Request(new URL("/index.html", url), request);
    return env.ASSETS.fetch(indexRequest);
  },
};

