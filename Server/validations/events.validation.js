const eventsValidator = {};
const { verifyTokenAndExecute } = require('../middleware/auth');
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

eventsValidator.validate_getMovementsByEvent = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.getMovementsByEvent);
}

eventsValidator.validate_createMovement = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.createMovement);
}

eventsValidator.validate_updateMovement = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.updateMovement);
}

eventsValidator.validate_deleteMovement = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.deleteMovement);
}

eventsValidator.validate_getDetailsByMovement = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.getDetailsByMovement);
}

eventsValidator.validate_createDetail = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.createDetail);
}

eventsValidator.validate_updateDetail = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.updateDetail);
}

eventsValidator.validate_deleteDetail = (req, res) => {
    verifyTokenAndExecute(req, res, eventsController.deleteDetail);
}

module.exports = eventsValidator;