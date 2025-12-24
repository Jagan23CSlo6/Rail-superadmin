const express = require('express');
const { registerSuperAdmin, loginSuperAdmin } = require('../controller/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { getAdminsList } = require("../controller/lists.controller");
const { createAdmin } = require('../controller/insert.controller');
const router = express.Router();

// Adding the super admin
router.post("/signup", async (req, res) => {
    const datas = req.body;
    const result = await registerSuperAdmin(datas);
    res.status(result.statusCode).json({ message: result.message });
});

// Super admin login
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

// Get admins list
router.get("/admins-list", async (req, res) => {
    const datas = await getAdminsList();
    if(datas.statusCode && datas.statusCode === 200) {
        return res.status(200).json({
            data: datas.data
        });
    }
    res.status(500).json({ message: "Internal Server Error" });
});

// Adding the admins
router.post("/create-admin", async (req, res) => {
    const datas = req.body;
    const result = await createAdmin(datas);
    res.status(result.statusCode).json({ message: result.message });
})

module.exports = router;