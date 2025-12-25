const { sendReport } = require("../models/report.model");
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
