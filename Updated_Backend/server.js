// Importing the packages
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// Values from .env file
dotenv.config();
const PORT = process.env.PORT;

// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/super-admin/v1/auth", require("./routes/super-admin.routes"));

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});