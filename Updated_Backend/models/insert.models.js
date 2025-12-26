const db = require('../db/db');

module.exports.insertAdmin = async ({ adminId, fullName, email, mobileNumber, password, paymentStatus, duration, amount }) => {
    const client = await db.connect();
    
    try {
        await client.query('BEGIN');

        // Insert admin
        const insertQuery = `
            INSERT INTO admin_accounts (
                admin_id, 
                full_name, 
                email, 
                mobile_number, 
                password_hash, 
                role, 
                payment_status, 
                duration, 
                amount,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING admin_id, full_name, email, mobile_number, role, 
                      payment_status, duration, amount, created_at, updated_at
        `;

        const values = [
            adminId,
            fullName,
            email,
            mobileNumber,
            password,
            'Admin',
            paymentStatus, 
            duration,
            amount
        ];

        await client.query(insertQuery, values);

        await client.query('COMMIT');

        return true;

    } catch (error) {
        console.error('Transaction error:', error);
        await client.query('ROLLBACK');
        console.error('Error inserting admin:', error);
        return false;
    } finally {
        client.release();
    }
};

module.exports.setPaymentStatus = async ({  adminId, isPaid}) => {
    const client = await db.connect();
    
    try {
        await client.query('BEGIN');

        const updateQuery = `
            UPDATE admin_accounts
            SET payment_status = $1,
                updated_at = NOW()
            WHERE admin_id = $2
        `;

        const values = [
            isPaid,
            adminId
        ];

        await client.query(updateQuery, values);

        await client.query('COMMIT');

        return true;

    } catch (error) {
        console.error('Transaction error:', error);
        await client.query('ROLLBACK');
        console.error('Error updating payment status:', error);
        return false;
    } finally {
        client.release();
    }
}

module.exports.getAdminById = async ({ adminId }) => {
    const client = await db.connect();

    try {
        const selectQuery = `
            SELECT admin_id, full_name, email, mobile_number, 
                   payment_status, duration, amount
            FROM admin_accounts
            WHERE admin_id = $1
        `;

        const values = [adminId];

        const res = await client.query(selectQuery, values);

        return res.rows[0];

    } catch (error) {
        console.error('Error fetching admin by ID:', error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports.deleteAdminById = async ({ adminId }) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const deleteQuery = `
            DELETE FROM admin_accounts
            WHERE admin_id = $1
            RETURNING admin_id
        `;

        const values = [adminId];

        const res = await client.query(deleteQuery, values);

        await client.query('COMMIT');

        return res.rows.length > 0;

    } catch (error) {
        console.error('Transaction error:', error);
        await client.query('ROLLBACK');
        console.error('Error deleting admin:', error);
        return false;
    } finally {
        client.release();
    }
};