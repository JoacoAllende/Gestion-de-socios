const express = require('express');
const router = express.Router();

const membership = require("../validations/membership.validation");

router.get('/memberships', membership.validate_getMemberships);
router.get('/memberships-discharged', membership.validate_getDischargedMemberships);
router.get('/memberships-categories/futbol', membership.validate_getFutbolCategories);
router.get('/memberships-categories/basquet', membership.validate_getBasquetCategories);
router.get('/memberships-categories/paleta', membership.validate_getPaletaCategories);
router.get('/memberships-card', membership.validate_getMembershipCard);
router.get('/membership/:nro_socio', membership.validate_getMembership);
router.post('/membership', membership.validate_createMembership);
router.put('/membership/:nro_socio', membership.validate_updateMembership);
// router.post('/membership/:to/:a', ensureToken, membership.validate_createGoleador);
// router.put('/membership/:to/:a', ensureToken, membership.validate_updateGoleador);
// router.delete('/membership/:id', ensureToken, membership.validate_deleteGoleador);

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