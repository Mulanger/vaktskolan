import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 5174);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function resolveRequest(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  if (pathname === "/quiz-demo" || pathname === "/quiz-demo/" || pathname === "/landing/quiz-demo" || pathname === "/landing/quiz-demo/") {
    return join(root, "quiz-demo.html");
  }
  if (pathname === "/studieteknik" || pathname === "/studieteknik/" || pathname === "/landing/studieteknik" || pathname === "/landing/studieteknik/") {
    return join(root, "studieteknik.html");
  }

  const requested = pathname === "/" ? "/index.html" : pathname.replace(/^\/landing(?=\/)/, "");
  const resolved = normalize(join(root, requested));

  if (!resolved.startsWith(root)) return null;
  return existsSync(resolved) ? resolved : join(root, "index.html");
}

createServer((request, response) => {
  const file = resolveRequest(request.url || "/");

  if (!file) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  const type = mimeTypes[extname(file)] || "application/octet-stream";
  response.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
  createReadStream(file).pipe(response);
}).listen(port, () => {
  console.log(`Landing page running at http://localhost:${port}`);
});
