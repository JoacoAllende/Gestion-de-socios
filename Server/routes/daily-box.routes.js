const express = require('express');
const router = express.Router();

const dailyBox = require("../validations/daily-box.validation");

router.get('/daily-box', ensureToken, dailyBox.validate_getDailyBox);

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
