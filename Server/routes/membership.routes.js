const express = require('express');
const router = express.Router();

const membership = require("../validations/membership.validation");

router.get('/memberships', membership.validar_getMemberships);
router.get('/membership/:id', membership.validar_getMembership);
router.post('/membership', membership.validar_createMembership);
router.put('/membership/:id', membership.validar_updateMembership);
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