// Importing necessary controller functions
const { registerSuperAdmin, loginSuperAdmin, verifyTokenAndGetUser } = require('../controller/auth.controller');
const { verifyTokenFromEvent } = require('./middleware/verifyToken');

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

// Handler for verifying token and getting user info (for auto-login)
module.exports.verifyTokenHandler = async (event) => {
    try {
        // Get token from cookie or Authorization header
        const cookies = event.headers.Cookie || event.headers.cookie || '';
        const authHeader = event.headers.Authorization || event.headers.authorization || '';
        
        let token = null;
        
        // Extract token from cookie
        if (cookies) {
            const tokenMatch = cookies.match(/token=([^;]+)/);
            if (tokenMatch) {
                token = tokenMatch[1];
            }
        }
        
        // Extract token from Authorization header if not found in cookie
        if (!token && authHeader) {
            token = authHeader.replace('Bearer ', '');
        }
        
        if (!token) {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
                body: JSON.stringify({
                    statusCode: 401,
                    message: 'No token provided'
                }),
            };
        }
        
        // Verify token and get user info
        const result = await verifyTokenAndGetUser(token);
        
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
                data: result.data
            }),
        };
    } catch (error) {
        console.error('Verify token error:', error);
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
