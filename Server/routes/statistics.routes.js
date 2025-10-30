const express = require('express');
const router = express.Router();

const statistics = require("../validations/statistics.validation");

router.get('/income-by-card/:mes/:anio', ensureToken, statistics.validate_getIncomeByMembershipCard);

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