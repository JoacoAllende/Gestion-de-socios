const express = require('express');
const router = express.Router();
const { ensureToken } = require('../middleware/auth');

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

module.exports = router;