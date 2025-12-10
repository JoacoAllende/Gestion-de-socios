const express = require('express');
const router = express.Router();

const dailyBox = require("../validations/daily-box.validation");

router.get('/daily-box/:anio', ensureToken, dailyBox.validate_getDailyBox);
router.get('/daily-box-movement/:id', ensureToken, dailyBox.validate_getMovementById);
router.post('/daily-box', ensureToken, dailyBox.validate_addMovement);
router.put('/daily-box/:id', ensureToken, dailyBox.validate_updateMovement);

function ensureToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports = router;
