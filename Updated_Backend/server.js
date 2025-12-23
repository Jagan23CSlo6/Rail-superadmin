// Importing the packages
const express = require("express");
const app = express();
const dotenv = require("dotenv");

// Values from .env file
dotenv.config();
const PORT = process.env.PORT;

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});