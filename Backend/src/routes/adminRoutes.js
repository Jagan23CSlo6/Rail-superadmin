// Imports from the packages
const express = require("express");

// Imports from the folder Controller
const {
  createAdmin,
  getAllAdmins,
  getAdminById,
  getAdminsBySuperAdminId,
  updateAdmin,
  updateAdminPassword,
  deleteAdmin,
  adminLogin,
  getDashboardSummary,
  getAdminPricing,
  updateAdminPricing,
} = require("../controller/adminController");

// Imports from the folder Middleware for the authentication (if you have one)
// const { authMiddleware } = require("../middleware/auth.middleware");

// Routes
const router = express.Router();

// ==================== POST Routes ====================

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login_id
 *               - password
 *             properties:
 *               login_id:
 *                 type: string
 *                 example: admin001
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Admin Login
router.post("/login", adminLogin);

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Create a new admin account
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - super_admin_id
 *               - admin_name
 *               - phone_number
 *               - login_id
 *               - password
 *             properties:
 *               super_admin_id:
 *                 type: integer
 *                 example: 1
 *               admin_name:
 *                 type: string
 *                 example: John Doe
 *               phone_number:
 *                 type: string
 *                 example: 9876543210
 *               location:
 *                 type: string
 *                 example: Mumbai
 *               login_id:
 *                 type: string
 *                 example: admin001
 *               password:
 *                 type: string
 *                 example: password123
 *               duration:
 *                 type: integer
 *                 description: Duration in months
 *                 example: 12
 *               amount:
 *                 type: number
 *                 example: 5000.00
 *               payment_status:
 *                 type: string
 *                 example: paid
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Create Admin Account
router.post("/register", createAdmin);

// ==================== GET Routes ====================

/**
 * @swagger
 * /api/admin/get-all-admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all admins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 admins:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Admin'
 */
// Get All Admins
router.get("/get-all-admins", getAllAdmins);

/**
 * @swagger
 * /api/admin/get-admin/{id}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get Admin by ID
router.get("/get-admin/:id", getAdminById);

/**
 * @swagger
 * /api/admin/get-by-super-admin/{super_admin_id}:
 *   get:
 *     summary: Get all admins by super admin ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: super_admin_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Super Admin ID
 *     responses:
 *       200:
 *         description: List of admins
 */
// Get Admins by Super Admin ID
router.get("/get-by-super-admin/:super_admin_id", getAdminsBySuperAdminId);
router.get("/dashboard-summary", getDashboardSummary);

// ==================== PUT Routes ====================

// Update Admin Details
router.put("/update-admin/:id", updateAdmin);

// Update Admin Password
router.put("/update-password/:id", updateAdminPassword);

// Update Admin Pricing
router.put("/update-pricing/:id", updateAdminPricing);

// ==================== GET Pricing Routes ====================

// Get Admin Pricing Details
router.get("/get-pricing/:id", getAdminPricing);

// ==================== DELETE Routes ====================

// Delete Admin Account
router.delete("/delete-admin/:id", deleteAdmin);

module.exports = router;
