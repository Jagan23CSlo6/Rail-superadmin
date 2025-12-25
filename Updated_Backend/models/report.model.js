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

module.exports.sendMonthRevenue = async ({ month }) => {
    try {
        const currentYear = new Date().getFullYear();
        
        const startDate = `${currentYear}-${String(month).padStart(2, '0')}-01`;
        
        // Calculate the next month for end date
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? currentYear + 1 : currentYear;
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

        const query = `
            SELECT
                COALESCE(SUM(b.total_amount), 0) AS total_amount_month
            FROM bookings b
            WHERE b.created_at >= $1 AND b.created_at < $2
        `;

        const result = await db.query(query, [startDate, endDate]);

        return {
            success: true,
            data: {
                totalAmountMonth: Number(result.rows[0].total_amount_month),
            }
        };
    } catch (error) {
        console.error("Error fetching monthly revenue:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports.sendYearlyRevenueGraph = async ({ year }) => {
    try {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const query = `
            SELECT 
                EXTRACT(MONTH FROM created_at)::int AS month,
                SUM(total_amount)::numeric AS amount
            FROM bookings
            WHERE created_at >= make_date($1, 1, 1)
              AND created_at <  make_date($1 + 1, 1, 1)
            GROUP BY month
            ORDER BY month
        `;

        const { rows } = await db.query(query, [year]);

        const monthlyMap = Object.fromEntries(
            rows.map(r => [r.month, Number(r.amount)])
        );

        const graphData = monthNames.map((name, i) => ({
            month: name,
            amount: monthlyMap[i + 1] || 0
        }));

        return {
            success: true,
            data: {
                year,
                months: graphData
            }
        };
    } catch (error) {
        console.error("Error fetching yearly revenue graph:", error);
        return {
            success: false,
            error: error.message
        };
    }
};

