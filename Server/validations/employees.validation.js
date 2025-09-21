const employeesValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'TheSecretKey';
const employeesController = require('../controllers/employees.controller');

employeesValidator.validate_getEmployees = (req, res) => {
    verifyTokenAndExecute(req, res, employeesController.getEmployees);
}

employeesValidator.validate_getEmployeeById = (req, res) => {
    verifyTokenAndExecute(req, res, employeesController.getEmployeeById);
}

employeesValidator.validate_createEmployee = (req, res) => {
    verifyTokenAndExecute(req, res, employeesController.createEmployee);
}

employeesValidator.validate_updateEmployee = (req, res) => {
    verifyTokenAndExecute(req, res, employeesController.updateEmployee);
}

employeesValidator.validate_loadSalary = (req, res) => {
    verifyTokenAndExecute(req, res, employeesController.loadSalary);
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
