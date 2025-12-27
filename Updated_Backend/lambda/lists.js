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

    try {
        const result = await getAdminsList();

        return {
            statusCode: result.statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
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

