const express = require('express');
const router = express.Router();

const membership = require("../validations/membership.validation");

router.get('/memberships', membership.validar_getMemberships);
router.get('/memberships-categories/futbol', membership.validar_getFutbolCategories);
router.get('/memberships-categories/basquet', membership.validar_getBasquetCategories);
router.get('/memberships-categories/paleta', membership.validar_getPaletaCategories);
router.get('/memberships-card', membership.validar_getMembershipCard);
router.get('/membership/:nro_socio', membership.validar_getMembership);
router.post('/membership', membership.validar_createMembership);
router.put('/membership/:nro_socio', membership.validar_updateMembership);
// router.post('/membership/:to/:a', ensureToken, membership.validar_createGoleador);
// router.put('/membership/:to/:a', ensureToken, membership.validar_updateGoleador);
// router.delete('/membership/:id', ensureToken, membership.validar_deleteGoleador);

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