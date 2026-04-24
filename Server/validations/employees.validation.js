const employeesValidator = {};
const { verifyTokenAndExecute } = require('../middleware/auth');
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

employeesValidator.validate_updatePayments = (req, res) => {
    verifyTokenAndExecute(req, res, employeesController.updatePayments);
}

employeesValidator.validate_initializeYear = (req, res) => {
    verifyTokenAndExecute(req, res, employeesController.initializeYear);
}

module.exports = employeesValidator;