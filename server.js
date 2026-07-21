const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 3002;

const server = http.createServer((req, res) => {
  let p = req.url === "/" ? "/在线答题.html" : decodeURIComponent(req.url);
  if (p.includes("..")) { res.writeHead(403); res.end("Forbidden"); return; }
  const fp = path.join(__dirname, p);
  if (!fp.startsWith(__dirname)) { res.writeHead(403); res.end("Forbidden"); return; }
  fs.readFile(fp, (e, d) => {
    res.writeHead(e ? 404 : 200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(d || "404");
  });
});

server.listen(PORT, "0.0.0.0", () => console.log("OK"));
