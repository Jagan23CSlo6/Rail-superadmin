const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createSuperAdmin, handleLogin } = require("../models/auth.models");

module.exports.registerSuperAdmin = async (datas) => {
    
    const { name, username, password, secureCode } = datas;

    if (!secureCode || secureCode.trim() !== process.env.SECURE_CODE?.trim()) {
    return {
      statusCode: 401,
      message: "Unauthorized",
    };
  }

    if(!username || !password || !name) {
        return {
            statusCode: 400,
            message: "All fields are required"
        };
    }

    if(password.length < 8) {
        return {
            statusCode: 400,
            message: "Password must be at least 8 characters long"
        };
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await createSuperAdmin({ name, username, password: hashedPassword });

    if(!superAdmin) {
        return {
            statusCode: 500,
            message: "Internal Server Error"
        }
    }

    return {
        statusCode: 201,
        message: "Super Admin registered successfully"
    }

}

module.exports.loginSuperAdmin = async (datas) => {
    
    const { username, password } = datas;

    if(!username || !password) {
        return {
            statusCode: 400,
            message: "Username and password are required"
        };
    }

    const result = await handleLogin({ username, password });

    if(!result.success) {
        return {
            statusCode: 401,
            message: "Invalid credentials"
        };
    }

    const token = jwt.sign(
        { username: username, name: result.name },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    return {
        statusCode: 200,
        message: "Login successful",
        name: result.name,
        token: token
    };
}

module.exports.verifyTokenAndGetUser = async (token) => {
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        return {
            statusCode: 200,
            message: "Token is valid",
            data: {
                username: decoded.username,
                name: decoded.name
            }
        };
    } catch (error) {
        return {
            statusCode: 401,
            message: "Invalid or expired token"
        };
    }
}
