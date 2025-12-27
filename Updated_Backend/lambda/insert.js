const { createAdmin, updatePaymentStatus, getAdminDetails, deleteAdmin } = require('../controller/insert.controller');
const { verifyTokenFromEvent } = require('./middleware/verifyToken');

// Handler for creating new admin
module.exports.createAdminHandler = async (event) => {
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

    const datas = JSON.parse(event.body);
    const result = await createAdmin(datas);
    
    return {
        statusCode: result.statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ 
            statusCode: result.statusCode,
            message: result.message
        }),
    };
};

// Handler for updating payment status
module.exports.updatePaymentStatusHandler = async (event) => {
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

    const datas = JSON.parse(event.body);
    const result = await updatePaymentStatus(datas);
    
    return {
        statusCode: result.statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ 
            statusCode: result.statusCode,
            message: result.message
        }),
    };
};

// Handler for getting admin details by ID
module.exports.getAdminDetailsHandler = async (event) => {
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

    const adminId = event.pathParameters?.adminId;
    const result = await getAdminDetails({ adminId });
    
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
            data: result.data || null
        }),
    };
};

// Handler for deleting admin by ID
module.exports.deleteAdminHandler = async (event) => {
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

    const adminId = event.pathParameters?.adminId;
    const result = await deleteAdmin({ adminId });
    
    return {
        statusCode: result.statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ 
            statusCode: result.statusCode,
            message: result.message
        }),
    };
};
