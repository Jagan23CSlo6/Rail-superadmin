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

        const result = await client.query(insertQuery, values);

        await client.query('COMMIT');

        return true;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error inserting admin:', error);
        return false;
    } finally {
        client.release();
    }
};

