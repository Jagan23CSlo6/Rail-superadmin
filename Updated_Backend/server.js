const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { getRedisClient } = require("./config/redis");

dotenv.config();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/super-admin/v1/auth", require("./routes/super-admin.routes"));
app.use("/api/super-admin/v1", require("./routes/super-admin.routes"));

// Connect Redis before starting server
(async () => {
  try {
    await getRedisClient();
    console.log("✅ Redis connected successfully!");
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
  }

  // Start server after Redis is connected (or failed)
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
