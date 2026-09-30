import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  if (url === "/") {
    res.writeHead(302, { Location: "/predict-simulator/" });
    res.end();
    return;
  }

  const mount = url === "/sheet-simulator" || url.startsWith("/sheet-simulator/")
    ? "sheet-simulator"
    : "predict-simulator";
  let rel = url;
  const prefix = "/" + mount;
  if (rel === prefix || rel.startsWith(prefix + "/")) {
    rel = rel.slice(prefix.length) || "/";
  }
  if (rel.endsWith("/")) rel += "index.html";

  const siteRoot = path.join(root, mount);
  const filePath = path.normalize(path.join(siteRoot, rel));
  const appIndex = path.join(root, "predict-simulator", "app", "index.html");

  if (!filePath.startsWith(siteRoot)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      const stream = fs.createReadStream(filePath);
      res.writeHead(200, {
        "Content-Type": mime[path.extname(filePath)] || "application/octet-stream",
      });
      stream.pipe(res);
      return;
    }

    if (mount === "predict-simulator" && rel.startsWith("/app/")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(appIndex).pipe(res);
      return;
    }

    send(res, 404, "Not found");
  });
});

server.listen(port, () => {
  console.log(`Predict Simulator: http://localhost:${port}/predict-simulator/`);
});
