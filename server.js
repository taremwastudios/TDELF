import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "8000", 10);

const MIME = {
    ".html": "text/html",
    ".css":  "text/css",
    ".js":   "text/javascript",
    ".json": "application/json",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif":  "image/gif",
    ".svg":  "image/svg+xml",
    ".ico":  "image/x-icon",
    ".pdf":  "application/pdf",
    ".jfif": "image/jpeg",
};

const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    const filePath = path.join(__dirname, urlPath);
    const ext = path.extname(filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            // Fall back to index.html for SPA routes
            fs.readFile(path.join(__dirname, "index.html"), (_, indexData) => {
                if (err) { res.writeHead(404); res.end("Not found"); return; }
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(indexData);
            });
            return;
        }
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(data);
    });
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
