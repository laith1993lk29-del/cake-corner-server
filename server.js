const express = require("express");
const cors = require("cors");

const app = express();

// PORT مرة وحدة فقط
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Cake Corner API Running ✅");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false });
  }

  if (username === "admin" && password === "admin123") {
    return res.json({
      success: true,
      user: { username: "admin", role: "admin" },
    });
  }

  res.status(401).json({ success: false });
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
