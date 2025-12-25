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
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return {
                statusCode: 200,
                message: "Admin list fetched successfully (cached)",
                data: JSON.parse(cachedData)
            };
        }
    } catch (redisError) {
        console.error('Redis get error:', redisError);
    }
    
    const result = await adminsList();

    if (!result.success) {
        return {
            statusCode: 500,
            message: "Failed to fetch admin list"
        };
    }

    const formattedData = result.data.map(admin => ({
        id: admin.admin_id,
        name: admin.full_name,
        loginId: admin.email,
        phoneNo: admin.mobile_number,
        since: formatDate(admin.created_at),
        nextPayment: calculateNextPayment(admin.created_at, admin.duration),
        paymentStatus: admin.payment_status
    }));

    // Cached for the 1 days
    try {
        await redisClient.setEx(cacheKey, 86400, JSON.stringify(formattedData));
    } catch (redisError) {
        console.error('Redis set error:', redisError);
    }

    return {
        statusCode: 200,
        message: "Admin list fetched successfully",
        data: formattedData
    };
};
