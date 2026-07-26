import { deriveClaims } from "../src/rules/engine.ts";
import type { EstateProfile } from "../src/rules/types.ts";

const landing = Bun.file(new URL("./landing.html", import.meta.url));
const index = Bun.file(new URL("./index.html", import.meta.url));
const app = Bun.file(new URL("./app.js", import.meta.url));
const tokens = Bun.file(new URL("./tokens.js", import.meta.url));

const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/derive") {
      const profile = (await request.json()) as EstateProfile;
      return Response.json(deriveClaims(profile));
    }

    if (url.pathname === "/app.js") {
      return new Response(app, { headers: { "Content-Type": "text/javascript" } });
    }

    if (url.pathname === "/tokens.js") {
      return new Response(tokens, { headers: { "Content-Type": "text/javascript" } });
    }

    // The interview lives at /app. The landing page owns the root so the demo can
    // open on the problem statement and click through into the tool.
    if (url.pathname === "/app" || url.pathname === "/index.html") {
      return new Response(index, { headers: { "Content-Type": "text/html" } });
    }

    if (url.pathname === "/") {
      return new Response(landing, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Virasat: http://localhost:${server.port} (landing) · /app (interview)`);
