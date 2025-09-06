const userValidator = {};

const userController = require('../controllers/user.controller');

userValidator.validate_registerUser = (req, res) => {
    userController.registerUser(req, res);
}

userValidator.validate_loginUser = (req, res) => {
    userController.loginUser(req, res);
}

module.exports = userValidator;