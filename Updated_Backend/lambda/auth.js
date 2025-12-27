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
  try {
    const datas = JSON.parse(event.body || "{}");
    const result = await loginSuperAdmin(datas);

    return {
      statusCode: result.statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL || '*',
        "Access-Control-Allow-Credentials": "true"
      },
      body: JSON.stringify({
        statusCode: result.statusCode,
        message: result.message,
        name: result.name,
        token: result.token
      })
    };
  } catch (err) {
    console.error("Login error:", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
        "Access-Control-Allow-Credentials": "true"
      },
      body: JSON.stringify({
        statusCode: 500,
        message: "Internal server error"
      })
    };
  }
};



// Handler for verifying token and getting user info (for auto-login)
module.exports.verifyTokenHandler = async (event) => {
    try {
        // Get token from Authorization header
        const authHeader = event.headers.Authorization || event.headers.authorization || '';
        
        if (!authHeader) {
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
        
        // Extract token from Authorization header (format: "Bearer <token>")
        const token = authHeader.replace('Bearer ', '');
        
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
