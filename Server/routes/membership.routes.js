const express = require('express');
const router = express.Router();

const membership = require("../validations/membership.validation");

router.get('/memberships', ensureToken, membership.validate_getMemberships);
router.get('/memberships-discharged', ensureToken, membership.validate_getDischargedMemberships);
router.get('/memberships-categories/futbol', membership.validate_getFutbolCategories);
router.get('/memberships-categories/basquet', membership.validate_getBasquetCategories);
router.get('/memberships-categories/paleta', membership.validate_getPaletaCategories);
router.get('/memberships-card', membership.validate_getMembershipCard);
router.get('/membership/:nro_socio', ensureToken, membership.validate_getMembership);
router.get('/membership-state/:dni', membership.validate_getMembershipStateByDni);
router.post('/membership', ensureToken, membership.validate_createMembership);
router.put('/membership/:nro_socio', ensureToken, membership.validate_updateMembership);

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