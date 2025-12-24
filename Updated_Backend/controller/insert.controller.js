const bcrypt = require('bcrypt');
const db = require('../db/db');

const { insertAdmin } = require('../models/insert.models');
// Generating the admin ID in format (ADM001, ADM002, ...)
const generateAdminId = async () => {
    try {
        const result = await db.query(
            `SELECT admin_id FROM admin_accounts 
             WHERE admin_id LIKE 'ADM%' 
             ORDER BY admin_id DESC 
             LIMIT 1`
        );

        if (result.rows.length === 0) {
            return 'ADM001';
        }

        const lastId = result.rows[0].admin_id;
        const numericPart = parseInt(lastId.substring(3)) + 1;
        const newId = 'ADM' + numericPart.toString().padStart(3, '0');
        
        return newId;
    } catch (error) {
        throw error;
    }
};

module.exports.createAdmin = async (datas) => {
  const { fullName, email, mobileNumber, password, paymentStatus, duration, amount } = datas;

  if (!fullName || !email || !mobileNumber || !password || !duration || !amount) {
    return { statusCode: 400, message: 'All fields are required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { statusCode: 400, message: 'Invalid email format.' };
  }

  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobileNumber)) {
    return { statusCode: 400, message: 'Invalid mobile number. Must be 10 digits.' };
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const adminId = await generateAdminId();
  const adminData = {
    adminId,
    fullName,
    email,
    mobileNumber,
    password: hashedPassword,
    paymentStatus: paymentStatus || 'pending', 
    duration,
    amount
  };

  const result = await insertAdmin(adminData);

  if(!result.success) {
    console.error('Failed to create admin account');
    return { statusCode: 500, message: 'Internal Server Error' };
  }

  return { statusCode: 200, message: "Created Successfully" };
};
