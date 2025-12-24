const jwt = require('jsonwebtoken');

// Helper function to verify token in Lambda
module.exports.verifyTokenFromEvent = (event) => {
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
            return { valid: false, message: 'Access denied. No token provided.' };
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return { valid: true, user: decoded };
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, message: 'Token expired.' };
        }
        if (error.name === 'JsonWebTokenError') {
            return { valid: false, message: 'Invalid token.' };
        }
        return { valid: false, message: 'Authentication failed.' };
    }
};
