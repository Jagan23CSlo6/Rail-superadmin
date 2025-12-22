// Packages
const bcrypt = require("bcrypt");

// Import from the Database folder
const db = require("../config/db.js");

// ============================================
// CREATE - Create Super Admin
// ============================================
const createSuperAdmin = async (req, res) => {
  const { super_admin_name, phone_number, email, password } = req.body;

  // Validation
  if (!super_admin_name || !phone_number || !email || !password) {
    return res.status(400).json({
      message: "All fields are required (super_admin_name, phone_number, email, password)",
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  // Phone number validation (basic)
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({
      message: "Invalid phone number format (10-15 digits)",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Check if super admin already exists with email or phone number
    const checkQuery = `
      SELECT * FROM super_admin 
      WHERE email = $1 OR phone_number = $2;
    `;
    const { rows: existingSuperAdmins } = await client.query(checkQuery, [
      email.trim().toLowerCase(),
      phone_number.trim(),
    ]);

    if (existingSuperAdmins.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "Super admin with this email or phone number already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new super admin
    const insertQuery = `
      INSERT INTO super_admin (super_admin_name, phone_number, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING super_admin_id, super_admin_name, phone_number, email, created_at;
    `;
    const { rows } = await client.query(insertQuery, [
      super_admin_name.trim(),
      phone_number.trim(),
      email.trim().toLowerCase(),
      hashedPassword,
    ]);

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Super admin created successfully",
      data: rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating super admin:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ============================================
// READ - Get All Super Admins
// ============================================
const getAllSuperAdmins = async (req, res) => {
  try {
    const query = `
      SELECT super_admin_id, super_admin_name, phone_number, email, created_at
      FROM super_admin
      ORDER BY created_at DESC;
    `;
    const { rows } = await db.query(query);

    return res.status(200).json({
      message: "Super admins retrieved successfully",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching super admins:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ============================================
// READ - Get Super Admin by ID
// ============================================
const getSuperAdminById = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      message: "Valid super admin ID is required",
    });
  }

  try {
    const query = `
      SELECT super_admin_id, super_admin_name, phone_number, email, created_at
      FROM super_admin
      WHERE super_admin_id = $1;
    `;
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Super admin not found",
      });
    }

    return res.status(200).json({
      message: "Super admin retrieved successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching super admin:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE - Update Super Admin
// ============================================
const updateSuperAdmin = async (req, res) => {
  const { id } = req.params;
  const { super_admin_name, phone_number, email, password } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      message: "Valid super admin ID is required",
    });
  }

  // At least one field must be provided for update
  if (!super_admin_name && !phone_number && !email && !password) {
    return res.status(400).json({
      message: "At least one field must be provided for update",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Check if super admin exists
    const checkExistQuery = `
      SELECT * FROM super_admin WHERE super_admin_id = $1;
    `;
    const { rows: existingAdmin } = await client.query(checkExistQuery, [id]);

    if (existingAdmin.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Super admin not found",
      });
    }

    // Check for duplicate email or phone number (excluding current record)
    if (email || phone_number) {
      const checkDuplicateQuery = `
        SELECT * FROM super_admin 
        WHERE (email = $1 OR phone_number = $2) AND super_admin_id != $3;
      `;
      const { rows: duplicates } = await client.query(checkDuplicateQuery, [
        email ? email.trim().toLowerCase() : existingAdmin[0].email,
        phone_number ? phone_number.trim() : existingAdmin[0].phone_number,
        id,
      ]);

      if (duplicates.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: "Email or phone number already exists",
        });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (super_admin_name) {
      updateFields.push(`super_admin_name = $${paramCount}`);
      values.push(super_admin_name.trim());
      paramCount++;
    }

    if (phone_number) {
      // Validate phone number
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(phone_number)) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Invalid phone number format (10-15 digits)",
        });
      }
      updateFields.push(`phone_number = $${paramCount}`);
      values.push(phone_number.trim());
      paramCount++;
    }

    if (email) {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Invalid email format",
        });
      }
      updateFields.push(`email = $${paramCount}`);
      values.push(email.trim().toLowerCase());
      paramCount++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    values.push(id);

    const updateQuery = `
      UPDATE super_admin
      SET ${updateFields.join(", ")}
      WHERE super_admin_id = $${paramCount}
      RETURNING super_admin_id, super_admin_name, phone_number, email, created_at;
    `;

    const { rows } = await client.query(updateQuery, values);

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Super admin updated successfully",
      data: rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating super admin:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ============================================
// DELETE - Delete Super Admin
// ============================================
const deleteSuperAdmin = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      message: "Valid super admin ID is required",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Check if super admin exists
    const checkQuery = `
      SELECT * FROM super_admin WHERE super_admin_id = $1;
    `;
    const { rows: existingAdmin } = await client.query(checkQuery, [id]);

    if (existingAdmin.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Super admin not found",
      });
    }

    // Check if there are associated admin_details (due to foreign key)
    const checkAdminsQuery = `
      SELECT COUNT(*) as count FROM admin_details WHERE super_admin_id = $1;
    `;
    const { rows: adminCount } = await client.query(checkAdminsQuery, [id]);

    if (parseInt(adminCount[0].count) > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Cannot delete super admin. There are ${adminCount[0].count} associated admin(s)`,
      });
    }

    // Delete super admin
    const deleteQuery = `
      DELETE FROM super_admin 
      WHERE super_admin_id = $1
      RETURNING super_admin_id, super_admin_name, email;
    `;
    const { rows } = await client.query(deleteQuery, [id]);

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Super admin deleted successfully",
      data: rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting super admin:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ============================================
// LOGIN - Super Admin Login
// ============================================
const superAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = email ? email.trim().toLowerCase() : "";
  const sanitizedPassword = password ? password.trim() : "";

  // Validation
  if (!normalizedEmail || !sanitizedPassword) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  const client = await db.connect();
  try {
    const query = `
      SELECT * FROM super_admin WHERE email = $1;
    `;
    const { rows } = await client.query(query, [normalizedEmail]);

    if (rows.length === 0) {
      console.warn("[superAdminLogin] Super admin not found", { email: normalizedEmail });
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    const superAdmin = rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      sanitizedPassword,
      superAdmin.password
    );

    if (!isPasswordValid) {
      console.warn("[superAdminLogin] Password mismatch", {
        email: normalizedEmail,
        superAdminId: superAdmin.super_admin_id,
      });
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Return super admin data without password
    const { password: _, ...superAdminData } = superAdmin;

    console.log("[superAdminLogin] Login successful", {
      email: normalizedEmail,
      superAdminId: superAdmin.super_admin_id,
    });

    return res.status(200).json({
      message: "Login successful",
      data: superAdminData,
    });
  } catch (error) {
    console.error("[superAdminLogin] Unexpected error", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  } finally {
    client.release();
  }
};

// Export all functions
module.exports = {
  createSuperAdmin,
  getAllSuperAdmins,
  getSuperAdminById,
  updateSuperAdmin,
  deleteSuperAdmin,
  superAdminLogin,
};
