// backend/controllers/usersController.js
const usersService = require('../services/usersService');
const asyncWrapper = require('../middleware/asyncWrapper');

exports.getUserInfo = asyncWrapper(async (req, res) => {
    const { userId } = req.params;
    const userIdNum = parseInt(userId, 10);

    if (Number.isNaN(userIdNum)) {
        return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
    }

    try {
        const userInfo = await usersService.getUserInfo(userIdNum);
        res.json(userInfo);
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
});

