const express = require('express');
const router = express.Router();

const payments = require("../validations/payments.validation");

router.put('/payments', ensureToken, payments.validate_updatePayments);
router.post('/payments/initialize-year/:anio', ensureToken, payments.validate_initializeYear);
router.put('/payments/recalculate', ensureToken, payments.validate_recalculatePayments);

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