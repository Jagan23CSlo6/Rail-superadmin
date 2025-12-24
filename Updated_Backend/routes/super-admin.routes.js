const express = require('express');
const { registerSuperAdmin, loginSuperAdmin } = require('../controller/auth.controller');
const router = express.Router();

router.post("/signup", async (req, res) => {
    const datas = req.body;
    const result = await registerSuperAdmin(datas);
    res.status(result.statusCode).json({ message: result.message });
});

router.post("/login", async (req, res) => {
    const datas = req.body;
    const result = await loginSuperAdmin(datas);
    
    if (result.statusCode === 200) {
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        
        return res.status(result.statusCode).json({ 
            message: result.message,
            name: result.name
        });
    }
    
    res.status(result.statusCode).json({ message: result.message });
});

module.exports = router;