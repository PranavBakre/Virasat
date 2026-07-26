import type { Env } from "./env.ts";
import { InterviewSession } from "./session.ts";

const ASSET_ALIASES: Readonly<Record<string, string>> = {
  "/": "/landing.html",
  "/app": "/index.html",
  "/v2": "/landing-v2.html",
};

function serveAsset(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  url.pathname = ASSET_ALIASES[url.pathname] ?? url.pathname;
  return env.ASSETS.fetch(new Request(url, request));
}

function openInterview(request: Request, env: Env): Response {
  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return new Response("Expected a WebSocket upgrade", { status: 426 });
  }
  const origin = request.headers.get("Origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return new Response("Forbidden", { status: 403 });
  }

  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];
  server.accept();

  const interview = new InterviewSession(server, env);
  interview.start();

  return new Response(null, { status: 101, webSocket: client });
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      return Promise.resolve(openInterview(request, env));
    }
    return serveAsset(request, env);
  },
} satisfies ExportedHandler<Env>;
