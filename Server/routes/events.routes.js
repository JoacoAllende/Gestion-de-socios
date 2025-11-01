const express = require('express');
const router = express.Router();

const events = require("../validations/events.validation");

router.get('/events', ensureToken, events.validate_getEvents);
router.get('/events/:id', ensureToken, events.validate_getEventById);
router.post('/events', ensureToken, events.validate_createEvent);
router.put('/events/:id', ensureToken, events.validate_updateEvent);

router.get('/events/:id/movements', ensureToken, events.validate_getMovementsByEvent);
router.post('/events/:id/movements', ensureToken, events.validate_createMovement);
router.put('/movements/:movementId', ensureToken, events.validate_updateMovement);
router.delete('/movements/:movementId', ensureToken, events.validate_deleteMovement);

router.get('/movements/:movementId/details', ensureToken, events.validate_getDetailsByMovement);
router.post('/movements/:movementId/details', ensureToken, events.validate_createDetail);
router.put('/details/:detailId', ensureToken, events.validate_updateDetail);
router.delete('/details/:detailId', ensureToken, events.validate_deleteDetail);

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