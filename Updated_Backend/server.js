const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/super-admin/v1/auth", require("./routes/super-admin.routes"));
app.use("/api/super-admin/v1", require("./routes/super-admin.routes"));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
