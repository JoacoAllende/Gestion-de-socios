const sponsorsValidator = {};
const { verifyTokenAndExecute } = require('../middleware/auth');
const sponsorsController = require('../controllers/sponsors.controller');

sponsorsValidator.validate_getSponsors = (req, res) => {
    verifyTokenAndExecute(req, res, sponsorsController.getSponsors);
}

sponsorsValidator.validate_getSponsorById = (req, res) => {
    verifyTokenAndExecute(req, res, sponsorsController.getSponsorById);
}

sponsorsValidator.validate_createSponsor = (req, res) => {
    verifyTokenAndExecute(req, res, sponsorsController.createSponsor);
}

sponsorsValidator.validate_updateSponsor = (req, res) => {
    verifyTokenAndExecute(req, res, sponsorsController.updateSponsor);
}

sponsorsValidator.validate_updatePayments = (req, res) => {
    verifyTokenAndExecute(req, res, sponsorsController.updatePayments);
}

sponsorsValidator.validate_initializeYear = (req, res) => {
    verifyTokenAndExecute(req, res, sponsorsController.initializeYear);
}

module.exports = sponsorsValidator;
