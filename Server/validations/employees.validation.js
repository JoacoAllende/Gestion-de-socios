const employeesValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'TheSecretKey';
const employeesController = require('../controllers/employees.controller');

employeesValidator.validate_getEmployees = (req, res) => {
    verifyTokenAndExecute(req, res, employeesController.getEmployees);
}

function verifyTokenAndExecute(req, res, nextFn) {
    jwt.verify(req.token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }
        nextFn(req, res);
    });
}

module.exports = employeesValidator;
