const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

/* middlewares */
app.use(cors());
app.use(express.json());

/* test */
app.get("/", (req, res) => {
  res.send("Cake Corner API Running ✅");
});

/* login */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "البيانات ناقصة",
    });
  }

  if (username === "admin" && password === "admin123") {
    return res.json({
      success: true,
      user: {
        username: "admin",
        role: "admin",
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: "بيانات الدخول غير صحيحة",
  });
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
