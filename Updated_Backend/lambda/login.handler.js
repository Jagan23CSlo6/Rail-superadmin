// Importing necessary controller functions
const { registerSuperAdmin, loginSuperAdmin } = require('../controller/auth.controller');

// Handler for super admin sign-up
module.exports.signUpHandler = async (event) => {
    const datas = JSON.parse(event.body);
    const result = await registerSuperAdmin(datas);    
    return {
        statusCode: result.statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: result.message }),
    };
};

// Handler for super admin login
module.exports.loginHandler = async (event) => {
    const datas = JSON.parse(event.body);
    const result = await loginSuperAdmin(datas);
    
    const response = {
        statusCode: result.statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ 
            statusCode: result.statusCode,
            message: result.message,
            name: result.name
        }),
    };

    if (result.statusCode === 200 && result.token) {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieString = `token=${result.token}; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Strict; Max-Age=86400; Path=/`;
        
        response.headers['Set-Cookie'] = cookieString;
    }
    
    return response;
};

