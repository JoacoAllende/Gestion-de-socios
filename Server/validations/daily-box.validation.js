const dailyBoxValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'TheSecretKey';
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

function verifyTokenAndExecute(req, res, nextFn) {
    jwt.verify(req.token, SECRET_KEY, (err) => {
        if (err) {
            return res.sendStatus(403);
        }
        nextFn(req, res);
    });
}

module.exports = dailyBoxValidator;
