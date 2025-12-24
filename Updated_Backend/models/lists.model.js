const db = require("../db/db");

module.exports.adminsList = async () => {
    const query = "SELECT admin_id, full_name, email, mobile_number, created_at, payment_status, duration FROM public.admin_accounts;";

    try {
        const res = await db.query(query);
        return {
            success: true,
            data: res.rows
        };
    } catch (error) {
        console.error("Error fetching admin list:", error);
        return {
            success: false,
            data: null
        };
    }
};
