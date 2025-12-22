require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const adminRoutes = require("./routes/adminRoutes.js");
const superAdminRoutes = require("./routes/superAdminRoutes.js");
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174", // Vite dev server
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:3000",
      "https://railway.artechnology.pro",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Railway API Documentation'
}));

app.use("/api/admin", adminRoutes);
app.use("/api/super-admin", superAdminRoutes);

module.exports = app;
