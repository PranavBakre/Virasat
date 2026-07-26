import { deriveClaims } from "../src/rules/engine.ts";
import type { EstateProfile } from "../src/rules/types.ts";

const index = Bun.file(new URL("./index.html", import.meta.url));
const app = Bun.file(new URL("./app.js", import.meta.url));

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

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(index, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Virasat web mockup: http://localhost:${server.port}`);
