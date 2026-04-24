const express = require('express');
const router = express.Router();
const { ensureToken } = require('../middleware/auth');

const employees = require("../validations/employees.validation");

router.post('/employees/initialize-year/:anio', ensureToken, employees.validate_initializeYear);
router.put('/employees/payments/:anio', ensureToken, employees.validate_updatePayments);
router.get('/employees/:anio', ensureToken, employees.validate_getEmployees);
router.get('/employee/:id', ensureToken, employees.validate_getEmployeeById);
router.post('/employee/:anio', ensureToken, employees.validate_createEmployee);
router.put('/employee/:id/:anio', ensureToken, employees.validate_updateEmployee);

module.exports = router;