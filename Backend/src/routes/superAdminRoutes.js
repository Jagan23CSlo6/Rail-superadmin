// Imports from the packages
const express = require("express");

// Imports from the folder Controller
const {
  createSuperAdmin,
  getAllSuperAdmins,
  getSuperAdminById,
  updateSuperAdmin,
  deleteSuperAdmin,
  superAdminLogin,
} = require("../controller/superAdminController");

// Imports from the folder Middleware for the authentication (if you have one)
// const { authMiddleware } = require("../middleware/auth.middleware");

// Routes
const router = express.Router();

// ==================== POST Routes ====================

/**
 * @swagger
 * /api/super-admin/login:
 *   post:
 *     summary: Super admin login
 *     tags: [Super Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: superadmin@railway.com
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
 *                 data:
 *                   $ref: '#/components/schemas/SuperAdmin'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Super Admin Login
router.post("/login", superAdminLogin);

/**
 * @swagger
 * /api/super-admin/register:
 *   post:
 *     summary: Create a new super admin account
 *     tags: [Super Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - super_admin_name
 *               - phone_number
 *               - email
 *               - password
 *             properties:
 *               super_admin_name:
 *                 type: string
 *                 example: John Doe
 *               phone_number:
 *                 type: string
 *                 example: 9876543210
 *               email:
 *                 type: string
 *                 example: superadmin@railway.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Super admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Super admin created successfully
 *                 data:
 *                   $ref: '#/components/schemas/SuperAdmin'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Super admin already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Create Super Admin Account
router.post("/register", createSuperAdmin);

// ==================== GET Routes ====================

/**
 * @swagger
 * /api/super-admin/get-all-super-admins:
 *   get:
 *     summary: Get all super admins
 *     tags: [Super Admin]
 *     responses:
 *       200:
 *         description: List of all super admins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Super admins retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SuperAdmin'
 */
// Get All Super Admins
router.get("/get-all-super-admins", getAllSuperAdmins);

/**
 * @swagger
 * /api/super-admin/get-super-admin/{id}:
 *   get:
 *     summary: Get super admin by ID
 *     tags: [Super Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Super Admin ID
 *     responses:
 *       200:
 *         description: Super admin details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Super admin retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/SuperAdmin'
 *       404:
 *         description: Super admin not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get Super Admin by ID
router.get("/get-super-admin/:id", getSuperAdminById);

// ==================== PUT Routes ====================

/**
 * @swagger
 * /api/super-admin/update-super-admin/{id}:
 *   put:
 *     summary: Update super admin details
 *     tags: [Super Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Super Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               super_admin_name:
 *                 type: string
 *                 example: John Doe Updated
 *               phone_number:
 *                 type: string
 *                 example: 9876543210
 *               email:
 *                 type: string
 *                 example: superadmin_updated@railway.com
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Super admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Super admin updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/SuperAdmin'
 *       404:
 *         description: Super admin not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Update Super Admin Details
router.put("/update-super-admin/:id", updateSuperAdmin);

// ==================== DELETE Routes ====================

/**
 * @swagger
 * /api/super-admin/delete-super-admin/{id}:
 *   delete:
 *     summary: Delete super admin account
 *     tags: [Super Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Super Admin ID
 *     responses:
 *       200:
 *         description: Super admin deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Super admin deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     super_admin_id:
 *                       type: integer
 *                     super_admin_name:
 *                       type: string
 *                     email:
 *                       type: string
 *       404:
 *         description: Super admin not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Cannot delete - has associated admins
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Delete Super Admin Account
router.delete("/delete-super-admin/:id", deleteSuperAdmin);

module.exports = router;
