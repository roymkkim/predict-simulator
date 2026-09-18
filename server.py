#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "predict-simulator"
PORT = int(os.environ.get("PORT", "4173"))


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path = path.split("?", 1)[0].split("#", 1)[0]
        if path in ("", "/"):
            return str(SITE / "index.html")
        if path.startswith("/predict-simulator"):
            path = path[len("/predict-simulator") :] or "/"
        if path.endswith("/"):
            path += "index.html"
        candidate = (SITE / path.lstrip("/")).resolve()
        if not str(candidate).startswith(str(SITE)):
            return str(SITE / "missing")
        if candidate.is_file():
            return str(candidate)
        if path.startswith("/app/"):
            return str(SITE / "app" / "index.html")
        return str(candidate)

    def do_GET(self):
        if self.path.split("?", 1)[0] in ("", "/"):
            self.send_response(302)
            self.send_header("Location", "/predict-simulator/")
            self.end_headers()
            return
        return super().do_GET()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Predict Simulator: http://127.0.0.1:{PORT}/predict-simulator/")
    server.serve_forever()
