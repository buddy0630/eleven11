const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db/index");

const app = express();
const PORT = 3000;
const JWT_SECRET = "fragloot_secret_key";

app.use(cors());
app.use(express.json());


function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admins only" });
  next();
}

app.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password)
    return res.status(400).json({ error: "All fields required" });
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1,$2,$3,$4) RETURNING id, first_name, email, role",
      [first_name, last_name, email, password_hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: "Invalid email or password" });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Invalid email or password" });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, first_name: user.first_name, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id");
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/products", authMiddleware, adminMiddleware, async (req, res) => {
  const { name, price, description, img, category, quantity, rating, discount } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO products (name, price, description, img, category, quantity, rating, discount) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [name, price, description, img, category, quantity || 0, rating || 0, discount || 0]
    );
    await logAdminAction(req.user.id, "CREATE", "products", result.rows[0].id, `Added product: ${name}`);
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/products/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { name, price, description, img, category, quantity, rating, discount } = req.body;
  try {
    const existing = await pool.query("SELECT img FROM products WHERE id = $1", [req.params.id]);
    const imgToSave = img || existing.rows[0]?.img || '';
    const result = await pool.query(
      "UPDATE products SET name=$1, price=$2, description=$3, img=$4, category=$5, quantity=$6, rating=$7, discount=$8 WHERE id=$9 RETURNING *",
      [name, price, description, imgToSave, category, quantity, rating, discount, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Product not found" });
    await logAdminAction(req.user.id, "UPDATE", "products", req.params.id, `Updated product: ${name}`);
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/products/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: "Product not found" });
    await logAdminAction(req.user.id, "DELETE", "products", req.params.id, `Deleted product id: ${req.params.id}`);
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Orders ───────────────────────────────────────────────────────────────────
app.get("/orders", authMiddleware, async (req, res) => {
  try {
    const query = req.user.role === "admin"
      ? "SELECT * FROM orders ORDER BY created_at DESC"
      : "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC";
    const params = req.user.role === "admin" ? [] : [req.user.id];
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Admin logs ───────────────────────────────────────────────────────────────
app.get("/admin/logs", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT al.*, u.email FROM admin_logs al JOIN admins a ON al.admin_id = a.id JOIN users u ON a.user_id = u.id ORDER BY al.created_at DESC"
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Helper: log admin actions ────────────────────────────────────────────────
async function logAdminAction(userId, action, tableName, recordId, note) {
  const admin = await pool.query("SELECT id FROM admins WHERE user_id = $1", [userId]);
  if (admin.rows[0]) {
    await pool.query(
      "INSERT INTO admin_logs (admin_id, action, table_name, record_id, note) VALUES ($1,$2,$3,$4,$5)",
      [admin.rows[0].id, action, tableName, recordId, note]
    );
  }
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
