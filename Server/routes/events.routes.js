const express = require('express');
const router = express.Router();

const events = require("../validations/events.validation");

router.get('/events', ensureToken, events.validate_getEvents);
router.get('/events/:id', ensureToken, events.validate_getEventById);
router.post('/events', ensureToken, events.validate_createEvent);
router.put('/events/:id', ensureToken, events.validate_updateEvent);

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