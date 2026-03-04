export interface Env {
  ASSETS: Fetcher;
}

function isHtmlNavigationRequest(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html");
}

function assetUrl(requestUrl: string, pathname: string): string {
  const url = new URL(requestUrl);
  url.pathname = pathname;
  url.search = "";
  return url.toString();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Some browsers still request /favicon.ico even when an explicit icon is set.
    // If it's missing, avoid noisy 500s and just return 204 (or fallback to vite.svg if present).
    if (url.pathname === "/favicon.ico") {
      try {
        const svgResponse = await env.ASSETS.fetch(
          new Request(assetUrl(request.url, "/vite.svg"))
        );
        if (svgResponse.ok) return svgResponse;
      } catch {
        // ignore and fall through
      }
      return new Response(null, { status: 204 });
    }

    try {
      // Serve static assets first.
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) return assetResponse;

      // SPA fallback: for navigations, return index.html so client-side routing works.
      if (!isHtmlNavigationRequest(request)) return assetResponse;

      return env.ASSETS.fetch(new Request(assetUrl(request.url, "/index.html")));
    } catch (error) {
      console.error("Worker fetch error:", error);
      return new Response("Worker threw exception", { status: 500 });
    }
  },
};
