const bcrypt = require("bcrypt");
const { createSuperAdmin } = require("../models/auth.models");

module.exports.registerSuperAdmin = async (datas) => {
    
    const { name, username, password, secureCode } = datas;

    if(!secureCode) {
        return {
            statusCode: 401,
            message: "Unauthorized"
        }
    }

    if(secureCode.trim() !== process.env.SECURE_CODE) {
        return {
            statusCode: 401,
            message: "Unauthorized"
        }
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