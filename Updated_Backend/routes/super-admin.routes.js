const express = require('express');
const { registerSuperAdmin } = require('../controller/auth.controller');
const router = express.Router();

router.post("/login", (req, res) => {
    const datas = req.body;
    const result  = registerSuperAdmin(datas);
    res.status(result.statusCode).json({ message: result.message });
})