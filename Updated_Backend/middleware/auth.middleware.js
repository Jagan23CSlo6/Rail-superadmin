const jwt = require('jsonwebtoken');

module.exports.verifyToken = (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                statusCode: 401,
                message: 'Access denied'
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                statusCode: 401,
                message: 'Access denied'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                statusCode: 401,
                message: 'Access denied'
            });
        }

        return res.status(500).json({
            statusCode: 500,
            message: 'Internal server error.'
        });
    }
};
