const { createAdmin } = require('../controller/insert.controller');
const { verifyTokenFromEvent } = require('./middleware/verifyToken');

// Handler for creating new admin
module.exports.createAdminHandler = async (event) => {
    const tokenVerification = verifyTokenFromEvent(event);

    // if (!tokenVerification.valid) {
    //     return {
    //         statusCode: 401,
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Access-Control-Allow-Origin': '*',
    //             'Access-Control-Allow-Credentials': true,
    //         },
    //         body: JSON.stringify({
    //             statusCode: 401,
    //             message: tokenVerification.message
    //         }),
    //     };
    // }

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
