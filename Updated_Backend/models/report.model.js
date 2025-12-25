const db = require("../db/db");

module.exports.sendReport = async () => {
    try {
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear + 1}-01-01`;

        const query = `
            SELECT
                COALESCE(SUM(b.total_amount), 0) AS total_amount_current_year,
                (SELECT COUNT(*) FROM admin_accounts) AS total_admins
            FROM bookings b
            WHERE b.created_at >= $1 AND b.created_at < $2
        `;

        const result = await db.query(query, [startDate, endDate]);

        return {
            success: true,
            data: {
                totalAmountCurrentYear: Number(result.rows[0].total_amount_current_year),
                totalAdmins: Number(result.rows[0].total_admins),
            }
        };
    } catch (error) {
        console.error("Error fetching report data:", error);
        return {
            success: false,
            error: error.message
        };
    }
};
