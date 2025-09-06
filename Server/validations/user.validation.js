const userValidator = {};

const userController = require('../controllers/user.controller');

userValidator.validar_registerUser = (req, res) => {
    userController.registerUser(req, res);
}

userValidator.validar_loginUser = (req, res) => {
    userController.loginUser(req, res);
}

module.exports = userValidator;