const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const membership = require("../validations/membership.validation");

const publicLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas peticiones. Intente de nuevo en un momento.' }
});

router.get('/memberships/:anio', ensureToken, membership.validate_getMemberships);
router.get('/memberships-active', ensureToken, membership.validate_getActiveMemberships);
router.get('/memberships-discharged', ensureToken, membership.validate_getDischargedMemberships);
router.get('/memberships-categories/futbol', ensureToken, membership.validate_getFutbolCategories);
router.get('/memberships-categories/basquet', ensureToken, membership.validate_getBasquetCategories);
router.get('/memberships-categories/paleta', ensureToken, membership.validate_getPaletaCategories);
router.get('/memberships-card', ensureToken, membership.validate_getMembershipCard);
router.get('/membership-state/:dni', publicLimiter, membership.validate_getMembershipStateByDni);
router.get('/membership/:nro_socio', ensureToken, membership.validate_getMembership);
router.post('/membership/:anio', ensureToken, membership.validate_createMembership);
router.put('/membership/:nro_socio/:anio', ensureToken, membership.validate_updateMembership);

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
