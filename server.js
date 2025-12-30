const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// --------------------
// تهيئة قاعدة البيانات
// --------------------
const db = new sqlite3.Database("./database.db");

// جدول المستخدمين
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )
`);

// جدول الطلبات
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cakeSize TEXT,
    cakeType TEXT,
    flavor TEXT,
    layers TEXT,
    message TEXT,
    cakeImage TEXT,

    deliveryDate TEXT,
    deliveryTime TEXT,
    deliveryType TEXT,
    address TEXT,

    totalPrice INTEGER,
    paid INTEGER,
    remaining INTEGER,

    customerName TEXT,
    phone TEXT,
    status TEXT,
    createdAt TEXT
  )
`);

// --------------------
// رفع الصور
// --------------------
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
app.use("/uploads", express.static("uploads"));
}

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

// --------------------
// تسجيل الدخول
// --------------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT id, username, role FROM users WHERE username=? AND password=?",
    [username, password],
    (err, row) => {
      if (row) {
  res.json(row); // يرجع المستخدم مباشرة
} else {
  res.status(401).json({ message: "Invalid credentials" });
}

    }
  );
});

// --------------------
// إدارة المستخدمين (Admin)
// --------------------

// جلب المستخدمين
app.get("/users", (req, res) => {
  db.all("SELECT id, username, role FROM users", (err, rows) => {
    res.json(rows);
  });
});

// إضافة مستخدم
app.post("/users", (req, res) => {
  const { username, password, role } = req.body;

  db.run(
    "INSERT INTO users (username, password, role) VALUES (?,?,?)",
    [username, password, role],
    (err) => {
      if (err) {
        res.status(400).json({ success: false });
      } else {
        res.json({ success: true });
      }
    }
  );
});

// حذف مستخدم
app.delete("/users/:id", (req, res) => {
  db.run("DELETE FROM users WHERE id=?", [req.params.id], () => {
    res.json({ success: true });
  });
});

// --------------------
// الطلبات
// --------------------

// إضافة طلب + صورة
app.post("/orders", upload.single("cakeImage"), (req, res) => {
  const o = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

  db.run(
    `
    INSERT INTO orders (
      cakeSize, cakeType, flavor, layers, message, cakeImage,
      deliveryDate, deliveryTime, deliveryType, address,
      totalPrice, paid, remaining,
      customerName, phone, status, createdAt
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,
    [
      o.cakeSize,
      o.cakeType,
      o.flavor,
      o.layers,
      o.message,
      imagePath,

      o.deliveryDate,
      o.deliveryTime,
      o.deliveryType,
      o.address,

      o.totalPrice,
      o.paid,
      o.remaining,

      o.customerName,
      o.phone,
      "قيد التحضير",
      new Date().toISOString(),
    ],
    () => res.json({ success: true })
  );
});

// جلب الطلبات
app.get("/orders", (req, res) => {
  db.all("SELECT * FROM orders ORDER BY deliveryDate ASC", (err, rows) => {
    res.json(rows);
  });
});

// تحديث حالة الطلب
app.put("/orders/:id/status", (req, res) => {
  db.run(
    "UPDATE orders SET status=? WHERE id=?",
    [req.body.status, req.params.id],
    () => res.json({ success: true })
  );
});

// --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
