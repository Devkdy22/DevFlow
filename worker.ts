type AssetsFetcher = { fetch: (request: Request) => Promise<Response> };

export interface Env {
  // Provided by Wrangler when using `[assets]` in `wrangler.toml`.
  // In misconfigured environments this can be missing, so treat it as optional.
  ASSETS?: AssetsFetcher;
}

function isHtmlNavigationRequest(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html");
}

function isLocalRequest(requestUrl: string): boolean {
  const url = new URL(requestUrl);
  return (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "::1"
  );
}

function assetUrl(requestUrl: string, pathname: string): string {
  const url = new URL(requestUrl);
  url.pathname = pathname;
  url.search = "";
  return url.toString();
}

function hasAssetsFetcher(env: Env): env is Env & { ASSETS: AssetsFetcher } {
  return typeof env.ASSETS?.fetch === "function";
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
      if (!hasAssetsFetcher(env)) {
        const message =
          "Missing ASSETS binding. Ensure `wrangler.toml` has `[assets] directory = \"client/dist\"`, run a client build, and start with `wrangler dev` from the repo root.";
        if (isHtmlNavigationRequest(request)) {
          return new Response(
            `<!doctype html><meta charset="utf-8"><title>DevFlow: misconfigured assets</title><pre>${escapeHtml(
              message
            )}</pre>`,
            { status: 500, headers: { "content-type": "text/html; charset=utf-8" } }
          );
        }
        return new Response(message, {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      // Serve static assets first.
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) return assetResponse;

      // SPA fallback: for navigations, return index.html so client-side routing works.
      if (!isHtmlNavigationRequest(request)) return assetResponse;

      return env.ASSETS.fetch(new Request(assetUrl(request.url, "/index.html")));
    } catch (error) {
      console.error("Worker fetch error:", error);
      const isLocal = isLocalRequest(request.url);
      const details =
        error instanceof Error
          ? `${error.name}: ${error.message}\n${error.stack ?? ""}`.trim()
          : String(error);

      if (isHtmlNavigationRequest(request)) {
        const body = isLocal
          ? `<!doctype html><meta charset="utf-8"><title>DevFlow: Worker error</title><pre>${escapeHtml(
              details
            )}</pre>`
          : "Worker threw exception";
        return new Response(body, {
          status: 500,
          headers: {
            "content-type": isLocal
              ? "text/html; charset=utf-8"
              : "text/plain; charset=utf-8",
          },
        });
      }

      return new Response(isLocal ? details : "Worker threw exception", {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  },
};
