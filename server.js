const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET" && req.url === "/products") {
    const raw = fs.readFileSync(path.join(__dirname, "data.json"), "utf-8");
    const data = JSON.parse(raw);
    res.writeHead(200);
    res.end(JSON.stringify(data.products));

  } else if (req.method === "GET" && req.url.startsWith("/products/")) {
    const id = parseInt(req.url.split("/")[2]);
    const raw = fs.readFileSync(path.join(__dirname, "data.json"), "utf-8");
    const data = JSON.parse(raw);
    const product = data.products.find((p) => p.id === id);
    if (product) {
      res.writeHead(200);
      res.end(JSON.stringify(product));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Product not found" }));
    }

  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Products: http://localhost:${PORT}/products`);
});
