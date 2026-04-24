const userValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) throw new Error('JWT_SECRET no configurado');

const userController = require('../controllers/user.controller');

userValidator.validate_registerUser = (req, res) => {
    verifyTokenAndExecute(req, res, userController.registerUser);
}

userValidator.validate_loginUser = (req, res) => {
    userController.loginUser(req, res);
}

function verifyTokenAndExecute(req, res, nextFn) {
    jwt.verify(req.token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }
        nextFn(req, res);
    });
}

module.exports = userValidator;