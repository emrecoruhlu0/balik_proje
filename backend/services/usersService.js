// backend/services/usersService.js
const pool = require('../config/db');

// Kullanıcı bilgilerini getir
exports.getUserInfo = async (userId) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                user_id,
                full_name,
                email,
                phone,
                created_at
            FROM users
            WHERE user_id = $1;
        `;
        const { rows } = await client.query(query, [userId]);
        if (rows.length === 0) {
            throw new Error('Kullanıcı bulunamadı');
        }
        return rows[0];
    } finally {
        client.release();
    }
};

