const eventsValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'TheSecretKey';
const eventsController = require('../controllers/events.controller');

eventsValidator.validate_getEvents = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.getEvents);
}

eventsValidator.validate_getEventById = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.getEventById);
}

eventsValidator.validate_createEvent = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.createEvent);
}

eventsValidator.validate_updateEvent = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.updateEvent);
}

function verifyTokenAndExecute(req, res, nextFn) {
    jwt.verify(req.token, SECRET_KEY, (err) => {
        if (err) {
            return res.sendStatus(403);
        }
        nextFn(req, res);
    });
}

module.exports = eventsValidator;