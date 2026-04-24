const dailyBoxValidator = {};
const { verifyTokenAndExecute } = require('../middleware/auth');
const dailyBoxController = require('../controllers/daily-box.controller');

dailyBoxValidator.validate_getDailyBox = (req, res) => {
    verifyTokenAndExecute(req, res, dailyBoxController.getDailyBox);
}

dailyBoxValidator.validate_getMovementById = (req, res) => {
  verifyTokenAndExecute(req, res, dailyBoxController.getMovementById);
}

dailyBoxValidator.validate_addMovement = (req, res) => {
    verifyTokenAndExecute(req, res, dailyBoxController.addMovement);
}

dailyBoxValidator.validate_updateMovement = (req, res) => {
    verifyTokenAndExecute(req, res, dailyBoxController.updateMovement);
}

module.exports = dailyBoxValidator;
