const { adminsList } = require("../models/lists.model");
const redisClient = require("../config/redis");

// Helper function to format date as dd/mm/yyyy
const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

// Helper function to calculate next payment date
const calculateNextPayment = (createdAt, duration) => {
    if (!duration) return null;
    
    const created = new Date(createdAt);
    const nextPayment = new Date(created);
    nextPayment.setMonth(nextPayment.getMonth() + duration);
    
    return formatDate(nextPayment);
};

module.exports.getAdminsList = async () => {
    const cacheKey = 'admins_list';
    
    try {
        // Check if data exists in cache
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            console.log('Returning cached admin list');
            return {
                statusCode: 200,
                message: "Admin list fetched successfully (cached)",
                data: JSON.parse(cachedData)
            };
        }
    } catch (redisError) {
        console.error('Redis get error:', redisError);
        // Continue to fetch from database if Redis fails
    }
    
    // Fetch from database
    const result = await adminsList();

    if (!result.success) {
        return {
            statusCode: 500,
            message: "Failed to fetch admin list"
        };
    }

    // Format the data
    const formattedData = result.data.map(admin => ({
        id: admin.admin_id,
        name: admin.full_name,
        loginId: admin.email,
        phoneNo: admin.mobile_number,
        since: formatDate(admin.created_at),
        nextPayment: calculateNextPayment(admin.created_at, admin.duration),
        paymentStatus: admin.payment_status
    }));

    // Cache the formatted data (TTL: 5 minutes)
    try {
        await redisClient.setEx(cacheKey, 300, JSON.stringify(formattedData));
        console.log('Admin list cached successfully');
    } catch (redisError) {
        console.error('Redis set error:', redisError);
        // Continue even if caching fails
    }

    return {
        statusCode: 200,
        message: "Admin list fetched successfully",
        data: formattedData
    };
};
