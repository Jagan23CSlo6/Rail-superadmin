const { getAdminsList } = require('../controller/lists.controller');
const { verifyTokenFromEvent } = require('./middleware/verifyToken');

// Handler for getting admins list
module.exports.getAdminsListHandler = async (event) => {
    // Verify token
    const tokenVerification = verifyTokenFromEvent(event);

    if (!tokenVerification.valid) {
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                statusCode: 401,
                message: tokenVerification.message
            }),
        };
    }

    const cacheKey = 'admins_list'; 

    try {
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                    'X-Cache': 'HIT'
                },
                body: JSON.stringify({
                    statusCode: 200,
                    message: 'Admins list fetched from cache',
                    data: JSON.parse(cachedData)
                }),
            };
        }

        const result = await getAdminsList();

        if (result?.statusCode === 200 && result?.data) {
            await redisClient.setEx(
                cacheKey,
                24 * 60 * 60,
                JSON.stringify(result.data)
            );
        }

        return {
            statusCode: result.statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
                'X-Cache': 'MISS'
            },
            body: JSON.stringify({
                statusCode: result.statusCode,
                message: result.message,
                data: result.data || []
            }),
        };

    } catch (err) {
        console.error('Redis / Handler Error:', err);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                statusCode: 500,
                message: 'Internal server error'
            }),
        };
    }
};

