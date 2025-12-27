const express = require('express');
const { registerSuperAdmin, loginSuperAdmin, verifyTokenAndGetUser } = require('../controller/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { getAdminsList } = require("../controller/lists.controller");
const { createAdmin } = require('../controller/insert.controller');
const { getReport, getMonthRevenue, getYearlyRevenueGraph } = require("../controller/report.controller");
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

// Verify token endpoint (for auto-login)
router.get("/verify", async (req, res) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                statusCode: 401,
                message: 'No token provided' 
            });
        }
        
        const result = await verifyTokenAndGetUser(token);
        
        return res.status(result.statusCode).json({
            statusCode: result.statusCode,
            message: result.message,
            data: result.data
        });
    } catch (error) {
        console.error('Verify token error:', error);
        return res.status(500).json({ 
            statusCode: 500,
            message: 'Internal server error' 
        });
    }
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

// Year based static report
router.get("/report-summary", async (req, res) => {
    try {
        const result = await getReport();

        return res.status(result.statusCode).json({
            message: result.message,
            data: result.data ?? {}
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            data: {}
        });
    }
});

// Month based revenue report
router.get("/month-revenue/:month", async (req, res) => {
    const month = req.params.month;

    try {
        const result = await getMonthRevenue(month);

        return res.status(result.statusCode).json({
            message: result.message,
            data: result.data ?? {}
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            data: {}
        });
    }
});

// Yearly revenue graph
router.get("/year-graph/:year", async (req, res) => {
    const year = req.params.year;

    try {
        const result = await getYearlyRevenueGraph(year);

        return res.status(result.statusCode).json({
            message: result.message,
            data: result.data ?? {}
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            data: {}
        });
    }
});

//  Update payment status of an admin
router.put("/update-payment-status", async (req, res) => {
    try {
        const result = await updatePaymentStatus(req.body);

        return res.status(result.statusCode).json({
            message: result.message,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
})

// Get admin details
router.get("/admin-details/:adminId", async (req, res) => {
    try {
        const datas = { adminId: req.params.adminId };
        const result = await getAdminDetails(datas);

        return res.status(result.statusCode).json({
            message: result.message,
            data: result.data ?? {}
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            data: {}
        });
    }
});

// Delete the admin
router.delete("/delete-admin/:adminId", async (req, res) => {
    try {
        const result = await deleteAdmin(req.params.adminId);

        return res.status(result.statusCode).json({
            message: result.message,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

module.exports = router;