const db = require("../db/db");

module.exports.createSuperAdmin = async ({ name, username, password }) => {
    
    const query = "INSERT INTO public.super_admin(name, username, password) VALUES($1, $2, $2);"
    const values = [name, username, password];

    try {
        await db.query(query, values);
        return true;
    } catch (error) {
        return false;
    }
};