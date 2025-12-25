const { sendReport, sendMonthRevenue } = require("../models/report.model");
const redisClient = require("../config/redis");

module.exports.getReport = async () => {
    const cacheKey = 'report_data';
    
    try {
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return {
                statusCode: 200,
                message: "Report data fetched successfully (cached)",
                data: JSON.parse(cachedData)
            };
        }
    } catch (redisError) {
        console.error('Redis get error:', redisError);
    }
    
    const result = await sendReport();

    if (result.success) {
        return {
            statusCode: 500,
            message: "Failed to fetch report data"
        };
    }

    // Cached for the 1 days
    try {
        await redisClient.setEx(cacheKey, 86400, JSON.stringify(result.data));
    } catch (redisError) {
        console.error('Redis set error:', redisError);
    }

    return {
        statusCode: 200,
        message: "Report data fetched successfully",
        data: result.data
    };
};

module.exports.getMonthRevenue = async (month) => {

    if (!month) {
        return {
            statusCode: 400,
            message: "Month parameter is required"
        };
    }

    const monthNumber = parseInt(month);
    
    if (isNaN(monthNumber)) {
        return {
            statusCode: 400,
            message: "Month must be a valid number"
        };
    }

    if (monthNumber < 1 || monthNumber > 12) {
        return {
            statusCode: 400,
            message: "Month must be between 1 and 12"
        };
    }

    const cacheKey = `month_revenue_${monthNumber}`;
    
    try {
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return {
                statusCode: 200,
                message: "Monthly revenue fetched successfully (cached)",
                data: JSON.parse(cachedData)
            };
        }
    } catch (redisError) {
        console.error('Redis get error:', redisError);
    }
    
    const result = await sendMonthRevenue({ month: monthNumber });

    if (!result.success) {
        return {
            statusCode: 500,
            message: "Failed to fetch monthly revenue"
        };
    }

    // Cached for 1 day
    try {
        await redisClient.setEx(cacheKey, 86400, JSON.stringify(result.data));
    } catch (redisError) {
        console.error('Redis set error:', redisError);
    }

    return {
        statusCode: 200,
        message: "Monthly revenue fetched successfully",
        data: result.data
    };
};
