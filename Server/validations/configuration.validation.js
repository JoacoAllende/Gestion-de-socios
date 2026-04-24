const configurationValidator = {};
const { verifyTokenAndExecute } = require('../middleware/auth');
const configurationController = require('../controllers/configuration.controller');

configurationValidator.validate_getActivityValues = (req, res) => {
    verifyTokenAndExecute(req, res, configurationController.getActivityValues);
}

configurationValidator.validate_updateActivityValue = (req, res) => {
    verifyTokenAndExecute(req, res, configurationController.updateActivityValue);
}

configurationValidator.validate_getDiscounts = (req, res) => {
    verifyTokenAndExecute(req, res, configurationController.getDiscounts);
}

configurationValidator.validate_updateDiscount = (req, res) => {
    verifyTokenAndExecute(req, res, configurationController.updateDiscount);
}

configurationValidator.validate_getBaseMemberValue = (req, res) => {
    verifyTokenAndExecute(req, res, configurationController.getBaseMemberValue);
}

configurationValidator.validate_updateBaseMemberValue = (req, res) => {
    verifyTokenAndExecute(req, res, configurationController.updateBaseMemberValue);
}

module.exports = configurationValidator;