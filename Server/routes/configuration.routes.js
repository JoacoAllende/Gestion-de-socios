const express = require('express');
const router = express.Router();

const configuration = require("../validations/configuration.validation");

router.get('/configuration/activity-values', ensureToken, configuration.validate_getActivityValues);
router.put('/configuration/activity-value/:id', ensureToken, configuration.validate_updateActivityValue);
router.get('/configuration/discounts', ensureToken, configuration.validate_getDiscounts);
router.put('/configuration/discount/:tipo', ensureToken, configuration.validate_updateDiscount);
router.get('/configuration/base-member-value', ensureToken, configuration.validate_getBaseMemberValue);
router.put('/configuration/base-member-value', ensureToken, configuration.validate_updateBaseMemberValue);

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