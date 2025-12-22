// Packages
const bcrypt = require("bcrypt");

// Import from the Database folder
const db = require("../config/db.js");
const { isAdminRegistrationEnabled } = require("../config/featureFlags");

// ============================================
// CREATE - Create Admin Details
// ============================================
const createAdmin = async (req, res) => {
  if (!isAdminRegistrationEnabled()) {
    return res.status(403).json({
      message: "Admin account creation is currently disabled",
    });
  }

  const {
    super_admin_id,
    admin_name,
    phone_number,
    location,
    login_id,
    password,
    duration, // duration in months
    amount,
    payment_status,
  } = req.body;

  // Validation
  if (
    !super_admin_id ||
    !admin_name ||
    !phone_number ||
    !login_id ||
    !password
  ) {
    return res.status(400).json({
      message:
        "All required fields must be provided (super_admin_id, admin_name, phone_number, login_id, password)",
    });
  }

  // Phone number validation
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({
      message: "Invalid phone number format (10-15 digits)",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Check if super admin exists
    const checkSuperAdminQuery = `
      SELECT * FROM super_admin WHERE super_admin_id = $1;
    `;
    const { rows: superAdminExists } = await client.query(
      checkSuperAdminQuery,
      [super_admin_id]
    );

    if (superAdminExists.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Super admin not found",
      });
    }

    // Check if admin already exists with phone number or login_id
    const checkQuery = `
      SELECT * FROM admin_accounts 
      WHERE phone_number = $1 OR login_id = $2;
    `;
    const { rows: existingAdmins } = await client.query(checkQuery, [
      phone_number.trim(),
      login_id.trim(),
    ]);

    if (existingAdmins.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "Admin with this phone number or login ID already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate next_payment_date based on join_date + duration (in months)
    const durationMonths = duration ? parseInt(duration) : null;

    // Insert new admin account
    let insertQuery;
    let values;

    if (durationMonths) {
      insertQuery = `
        INSERT INTO admin_accounts (
          super_admin_id, 
          admin_name, 
          phone_number, 
          location, 
          login_id, 
          password, 
          duration, 
          amount, 
          payment_status,
          next_payment_date
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          CURRENT_DATE + make_interval(months => $7)
        )
        RETURNING 
          admin_id, 
          super_admin_id, 
          admin_name, 
          phone_number, 
          location, 
          join_date, 
          next_payment_date, 
          login_id, 
          duration, 
          amount, 
          payment_status,
          created_at,
          updated_at;
      `;

      values = [
        super_admin_id,
        admin_name.trim(),
        phone_number.trim(),
        location?.trim() || null,
        login_id.trim(),
        hashedPassword,
        durationMonths,
        amount || null,
        payment_status || "Pending",
      ];
    } else {
      insertQuery = `
        INSERT INTO admin_accounts (
          super_admin_id, 
          admin_name, 
          phone_number, 
          location, 
          login_id, 
          password, 
          duration, 
          amount, 
          payment_status,
          next_payment_date
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, NULL, $7, $8, NULL
        )
        RETURNING 
          admin_id, 
          super_admin_id, 
          admin_name, 
          phone_number, 
          location, 
          join_date, 
          next_payment_date, 
          login_id, 
          duration, 
          amount, 
          payment_status,
          created_at,
          updated_at;
      `;

      values = [
        super_admin_id,
        admin_name.trim(),
        phone_number.trim(),
        location?.trim() || null,
        login_id.trim(),
        hashedPassword,
        amount || null,
        payment_status || "Pending",
      ];
    }

    const { rows } = await client.query(insertQuery, values);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Admin created successfully",
      admin: rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating admin:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

// ============================================
// READ - Get All Admins
// ============================================
const getAllAdmins = async (req, res) => {
  const client = await db.connect();
  try {
    // Use a generic select to tolerate schema differences between environments.
    const { rows } = await client.query(
      "SELECT * FROM admin_accounts ORDER BY created_at DESC;"
    );

    const mapped = rows.map((row) => {
      const normalizeStatus = String(
        row.payment_status ?? row.status ?? "Pending"
      ).toLowerCase();
      const payment_status =
        normalizeStatus === "completed"
          ? "Completed"
          : normalizeStatus === "pending"
          ? "Pending"
          : "Over Due";

      const formatDate = (value) => {
        if (!value) return null;
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
      };

      return {
        admin_id: row.admin_id ?? row.id ?? null,
        super_admin_id: row.super_admin_id ?? null,
        admin_name: row.admin_name ?? row.full_name ?? "Unknown",
        phone_number: row.phone_number ?? row.mobile_number ?? "N/A",
        location: row.location ?? null,
        join_date: formatDate(row.join_date ?? row.created_at),
        next_payment_date: formatDate(row.next_payment_date),
        login_id: row.login_id ?? row.email ?? "N/A",
        duration: row.duration ?? null,
        amount: row.amount ?? null,
        payment_status,
        created_at: formatDate(row.created_at),
        updated_at: formatDate(row.updated_at),
      };
    });

    res.status(200).json({
      message: "Admins retrieved successfully",
      count: mapped.length,
      admins: mapped,
    });
  } catch (err) {
    console.error("Error retrieving admins:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

// ============================================
// READ - Get Admin by ID
// ============================================
const getAdminById = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Valid admin ID is required" });
  }

  const client = await db.connect();
  try {
    const query = `
      SELECT 
        aa.admin_id,
        aa.super_admin_id,
        sa.super_admin_name,
        aa.admin_name,
        aa.phone_number,
        aa.location,
        aa.join_date,
        aa.next_payment_date,
        aa.login_id,
        aa.duration,
        aa.amount,
        aa.payment_status,
        aa.created_at,
        aa.updated_at
      FROM admin_accounts aa
      LEFT JOIN super_admin sa ON aa.super_admin_id = sa.super_admin_id
      WHERE aa.admin_id = $1;
    `;

    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      message: "Admin retrieved successfully",
      admin: rows[0],
    });
  } catch (err) {
    console.error("Error retrieving admin:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

// ============================================
// UPDATE - Update Admin Details
// ============================================
const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const {
    admin_name,
    phone_number,
    location,
    login_id,
    password,
    duration,
    amount,
    payment_status,
  } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Valid admin ID is required" });
  }

  // Check if at least one field is provided for update
  if (
    !admin_name &&
    !phone_number &&
    !location &&
    !login_id &&
    !password &&
    !duration &&
    !amount &&
    !payment_status
  ) {
    return res.status(400).json({
      message: "At least one field must be provided for update",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Check if admin exists
    const checkExistQuery = `
      SELECT * FROM admin_accounts WHERE admin_id = $1;
    `;
    const { rows: existingAdmin } = await client.query(checkExistQuery, [id]);

    if (existingAdmin.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check for duplicate phone number or login_id (excluding current record)
    if (phone_number || login_id) {
      const checkDuplicateQuery = `
        SELECT * FROM admin_accounts 
        WHERE (phone_number = $1 OR login_id = $2) AND admin_id != $3;
      `;
      const { rows: duplicates } = await client.query(checkDuplicateQuery, [
        phone_number ? phone_number.trim() : existingAdmin[0].phone_number,
        login_id ? login_id.trim() : existingAdmin[0].login_id,
        id,
      ]);

      if (duplicates.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: "Phone number or login ID already exists",
        });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (admin_name) {
      updateFields.push(`admin_name = $${paramCount}`);
      values.push(admin_name.trim());
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

    if (location !== undefined) {
      updateFields.push(`location = $${paramCount}`);
      values.push(location ? location.trim() : null);
      paramCount++;
    }

    if (login_id) {
      updateFields.push(`login_id = $${paramCount}`);
      values.push(login_id.trim());
      paramCount++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (duration !== undefined) {
      const durationMonths = duration ? parseInt(duration) : null;
      if (durationMonths) {
        updateFields.push(`duration = $${paramCount}`);
        values.push(durationMonths);
        paramCount++;

        // Recalculate next_payment_date based on join_date + new duration
        updateFields.push(
          `next_payment_date = join_date + make_interval(months => $${paramCount})`
        );
        values.push(durationMonths);
        paramCount++;
      } else {
        updateFields.push(`duration = NULL`);
        updateFields.push(`next_payment_date = NULL`);
      }
    }

    if (amount !== undefined) {
      updateFields.push(`amount = $${paramCount}`);
      values.push(amount || null);
      paramCount++;
    }

    if (payment_status !== undefined) {
      updateFields.push(`payment_status = $${paramCount}`);
      values.push(payment_status || "Pending");
      paramCount++;
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);

    const updateQuery = `
      UPDATE admin_accounts
      SET ${updateFields.join(", ")}
      WHERE admin_id = $${paramCount}
      RETURNING 
        admin_id, 
        super_admin_id, 
        admin_name, 
        phone_number, 
        location, 
        join_date, 
        next_payment_date, 
        login_id, 
        duration, 
        amount, 
        payment_status,
        created_at,
        updated_at;
    `;

    const { rows } = await client.query(updateQuery, values);

    await client.query("COMMIT");

    res.status(200).json({
      message: "Admin details updated successfully",
      admin: rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating admin:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

// ============================================
// UPDATE - Update Admin Password
// ============================================
const updateAdminPassword = async (req, res) => {
  const { id } = req.params;
  const { current_password, new_password } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Valid admin ID is required" });
  }

  if (!current_password || !new_password) {
    return res.status(400).json({
      message: "Current password and new password are required",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Get admin with password
    const getAdminQuery = `
      SELECT * FROM admin_accounts WHERE admin_id = $1;
    `;
    const { rows } = await client.query(getAdminQuery, [id]);

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      current_password,
      rows[0].password
    );

    if (!isPasswordValid) {
      await client.query("ROLLBACK");
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const new_password_hash = await bcrypt.hash(new_password, 10);

    // Update password
    const updateQuery = `
      UPDATE admin_accounts
      SET password = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE admin_id = $2
      RETURNING admin_id, admin_name, login_id;
    `;

    const { rows: updatedRows } = await client.query(updateQuery, [
      new_password_hash,
      id,
    ]);

    await client.query("COMMIT");

    res.status(200).json({
      message: "Password updated successfully",
      admin: updatedRows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating password:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

// ============================================
// DELETE - Delete Admin
// ============================================
const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Valid admin ID is required" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Check if admin exists
    const checkQuery = `
      SELECT * FROM admin_accounts WHERE admin_id = $1;
    `;
    const { rows: existingAdmin } = await client.query(checkQuery, [id]);

    if (existingAdmin.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Admin not found" });
    }

    // Delete admin
    const deleteQuery = `
      DELETE FROM admin_accounts 
      WHERE admin_id = $1
      RETURNING admin_id, admin_name, phone_number, login_id;
    `;
    const { rows: deletedAdmin } = await client.query(deleteQuery, [id]);

    await client.query("COMMIT");

    res.status(200).json({
      message: "Admin deleted successfully",
      deletedAdmin: deletedAdmin[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting admin:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

// ============================================
// LOGIN - Admin Login
// ============================================
const adminLogin = async (req, res) => {
  const { login_id, password } = req.body;
  const sanitizedLoginId = login_id ? login_id.trim() : "";
  const sanitizedPassword = password ? password.trim() : "";

  console.log("[adminLogin] Incoming login attempt", {
    login_id: sanitizedLoginId,
    hasPassword: Boolean(sanitizedPassword),
  });

  if (!sanitizedLoginId || !sanitizedPassword) {
    console.warn("[adminLogin] Missing login_id or password input", {
      loginIdPresent: Boolean(sanitizedLoginId),
      passwordPresent: Boolean(sanitizedPassword),
    });
    return res.status(400).json({
      message: "Login ID and password are required",
    });
  }

  const client = await db.connect();
  try {
    const query = `
      SELECT 
        aa.*,
        sa.super_admin_name
      FROM admin_accounts aa
      LEFT JOIN super_admin sa ON aa.super_admin_id = sa.super_admin_id
      WHERE aa.login_id = $1;
    `;
    const { rows } = await client.query(query, [sanitizedLoginId]);

    if (rows.length === 0) {
      console.warn("[adminLogin] Admin not found", {
        login_id: sanitizedLoginId,
      });
      return res.status(401).json({ message: "Invalid login ID or password" });
    }

    const admin = rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      sanitizedPassword,
      admin.password
    );

    if (!isPasswordValid) {
      console.warn("[adminLogin] Password mismatch", {
        login_id: sanitizedLoginId,
        adminId: admin.admin_id,
      });
      return res.status(401).json({ message: "Invalid login ID or password" });
    }

    // Return admin data without password
    const { password: _, ...adminData } = admin;

    console.log("[adminLogin] Login successful", {
      login_id: sanitizedLoginId,
      adminId: admin.admin_id,
    });

    res.status(200).json({
      message: "Login successful",
      admin: adminData,
    });
  } catch (err) {
    console.error("[adminLogin] Unexpected error", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

// ============================================
// READ - Get Admins by Super Admin ID
// ============================================
const getAdminsBySuperAdminId = async (req, res) => {
  const { super_admin_id } = req.params;

  if (!super_admin_id || isNaN(super_admin_id)) {
    return res.status(400).json({
      message: "Valid super admin ID is required",
    });
  }

  const client = await db.connect();
  try {
    const query = `
      SELECT 
        aa.admin_id,
        aa.super_admin_id,
        sa.super_admin_name,
        aa.admin_name,
        aa.phone_number,
        aa.location,
        aa.join_date,
        aa.next_payment_date,
        aa.login_id,
        aa.duration,
        aa.amount,
        aa.payment_status,
        aa.created_at,
        aa.updated_at
      FROM admin_accounts aa
      LEFT JOIN super_admin sa ON aa.super_admin_id = sa.super_admin_id
      WHERE aa.super_admin_id = $1
      ORDER BY aa.created_at DESC;
    `;
    const { rows } = await client.query(query, [super_admin_id]);

    res.status(200).json({
      message: "Admins retrieved successfully",
      count: rows.length,
      admins: rows,
    });
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

// ============================================
// READ - Dashboard Summary
// ============================================
const getDashboardSummary = async (req, res) => {
  const client = await db.connect();
  try {
    const revenueQuery = `
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(SUM(
          CASE
            WHEN DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE)
            THEN total_amount
          END
        ), 0) AS current_month_revenue,
        COALESCE(SUM(
          CASE
            WHEN DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            THEN total_amount
          END
        ), 0) AS previous_month_revenue
      FROM bookings;
    `;
    const {
      rows: [revenueRow],
    } = await client.query(revenueQuery);

    const monthlyQuery = `
      SELECT
        EXTRACT(MONTH FROM booking_date)::INT AS month,
        COALESCE(SUM(total_amount), 0) AS revenue
      FROM bookings
      WHERE booking_date IS NOT NULL
        AND DATE_TRUNC('year', booking_date) = DATE_TRUNC('year', CURRENT_DATE)
      GROUP BY month
      ORDER BY month;
    `;
    const { rows: monthlyRows } = await client.query(monthlyQuery);

    const adminMetricsQuery = `
      SELECT
        COUNT(*)::INT AS total_admins,
        COUNT(*) FILTER (WHERE LOWER(payment_status) = 'completed')::INT AS active_admins
      FROM admin_accounts;
    `;
    const {
      rows: [adminMetricsRow],
    } = await client.query(adminMetricsQuery);

    const toNumber = (value) => Number(value) || 0;
    const totalRevenue = toNumber(revenueRow?.total_revenue);
    const currentMonthRevenue = toNumber(revenueRow?.current_month_revenue);
    const previousMonthRevenue = toNumber(revenueRow?.previous_month_revenue);
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const match = monthlyRows.find((row) => Number(row.month) === index + 1);
      return toNumber(match?.revenue);
    });

    const formatGrowth = (current, previous) => {
      if (previous === 0) {
        if (current === 0) return "0.0% vs last month";
        return "+100.0% vs last month";
      }
      const change = ((current - previous) / previous) * 100;
      const prefix = change >= 0 ? "+" : "";
      return `${prefix}${change.toFixed(1)}% vs last month`;
    };

    return res.status(200).json({
      totalRevenue,
      revenueGrowth: formatGrowth(currentMonthRevenue, previousMonthRevenue),
      monthRevenue: currentMonthRevenue,
      monthGrowth: formatGrowth(currentMonthRevenue, previousMonthRevenue),
      totalAdmins: toNumber(adminMetricsRow?.total_admins),
      activeAdmins: toNumber(adminMetricsRow?.active_admins),
      monthlyData,
    });
  } catch (error) {
    console.error("Error generating dashboard summary:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  getAdminsBySuperAdminId,
  updateAdmin,
  updateAdminPassword,
  deleteAdmin,
  adminLogin,
  getDashboardSummary,
};
