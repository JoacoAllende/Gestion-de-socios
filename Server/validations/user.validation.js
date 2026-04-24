const userValidator = {};
const { verifyTokenAndExecute } = require('../middleware/auth');

const userController = require('../controllers/user.controller');

userValidator.validate_registerUser = (req, res) => {
    verifyTokenAndExecute(req, res, userController.registerUser);
}

userValidator.validate_loginUser = (req, res) => {
    userController.loginUser(req, res);
}

module.exports = userValidator;