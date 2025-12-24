const db = require("../db/db");
const bcrypt = require("bcrypt");

// Creating the super admins
module.exports.createSuperAdmin = async ({ name, username, password }) => {
    
    const query = "INSERT INTO public.super_admin(name, username, password) VALUES($1, $2, $3);"
    const values = [name, username, password];

    try {
        await db.query(query, values);
        return true;
    } catch (error) {
        return false;
    }
};

// Handling logins
module.exports.handleLogin = async ({ username, password }) => {

    const query = "SELECT super_admin_name, password FROM public.super_admin WHERE username=$1;";
    const values = [username];

    try {
        const res = await db.query(query, values);
        
        if (res.rows.length === 0) {
            return { success: false, name: null };
        }

        const isPasswordValid = await bcrypt.compare(password, res.rows[0].password);

        if (!isPasswordValid) {
            return { success: false, name: null };
        }

        return {
            success: true,
            name: res.rows[0].super_admin_name
        };
    }

    catch (error) {
        return { success: false, name: null };
    }
}