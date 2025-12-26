const bcrypt = require('bcrypt');
const db = require('../db/db');
const redisClient = require('../config/redis');

const { insertAdmin, setPaymentStatus, getAdminById, deleteAdminById } = require('../models/insert.models');
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

  if(result.success) {
    console.error('Failed to create admin account');
    return { statusCode: 500, message: 'Internal Server Error' };
  }

  // Delete admins list cache after successful insertion
  try {
    await redisClient.del('admins_list');
    console.log('Admins list cache invalidated');
  } catch (cacheError) {
    console.error('Error invalidating cache:', cacheError);
    // Don't fail the request if cache deletion fails
  }

  return { statusCode: 200, message: "Created Successfully" };
};

// Update payment status of an admin
module.exports.updatePaymentStatus = async (datas) => {
    const { adminId, isPaid } = datas;

    if (!adminId || typeof isPaid !== 'boolean') {
        return { statusCode: 400, message: 'adminId and isPaid are required.' };
    }

    const result = await setPaymentStatus({ adminId, isPaid });

    if(result) {
        // Invalidate cache after successful update
        try {
            await redisClient.del('admins_list');
            await redisClient.del(`admin_details_${adminId}`);
            console.log('Cache invalidated for admin:', adminId);
        } catch (cacheError) {
            console.error('Error invalidating cache:', cacheError);
        }
        
        return { statusCode: 200, message: "Payment status updated successfully." };
    } else {
        console.error('Failed to update payment status');
        return { statusCode: 500, message: 'Internal Server Error' };
    }
}

// Get admin details
module.exports.getAdminDetails = async (datas) => {
    const { adminId } = datas;

    if (!adminId) {
        return { statusCode: 400, message: 'adminId is required.' };
    }

    const cacheKey = `admin_details_${adminId}`;
    
    try {
        // Try to get cached data
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return {
                statusCode: 200,
                message: "Admin details fetched successfully (cached)",
                data: JSON.parse(cachedData)
            };
        }
    } catch (redisError) {
        console.error('Redis get error:', redisError);
    }

    try {
        const adminDetails = await getAdminById({ adminId });

        if (!adminDetails) {
            return { statusCode: 404, message: 'Admin not found.' };
        }

        // Format the response data
        const formattedData = {
            id: adminDetails.admin_id,
            name: adminDetails.full_name,
            email: adminDetails.email,
            phoneNo: adminDetails.mobile_number,
            paymentStatus: adminDetails.payment_status ? "paid" : "pending",
            duration: adminDetails.duration,
            amount: adminDetails.amount
        };

        // Cache the result for 1 day (86400 seconds)
        try {
            await redisClient.setEx(cacheKey, 86400, JSON.stringify(formattedData));
        } catch (redisError) {
            console.error('Redis set error:', redisError);
        }

        return { 
            statusCode: 200, 
            message: 'Admin details fetched successfully.',
            data: formattedData
        };
    } catch (error) {
        console.error('Error fetching admin details:', error);
        return { statusCode: 500, message: 'Internal Server Error' };
    }
}

// Delete admin by ID
module.exports.deleteAdmin = async ({ adminId }) => {
    if (!adminId) {
        return { statusCode: 400, message: 'adminId is required.' };
    }

    try {
        const result = await deleteAdminById({ adminId });

        if (result) {
            // Remove the admin list cache and specific admin details cache
            try {
                await redisClient.del('admins_list');
                await redisClient.del(`admin_details_${adminId}`);
                console.log('Cache invalidated for deleted admin:', adminId);
            } catch (cacheError) {
                console.error('Error invalidating cache:', cacheError);
            }

            return { statusCode: 200, message: 'Admin deleted successfully.' };
        } else {
            return { statusCode: 404, message: 'Admin not found or could not be deleted.' };
        }
    } catch (error) {
        console.error('Error deleting admin:', error);
        return { statusCode: 500, message: 'Internal Server Error' };
    }
};
        