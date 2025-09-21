const express = require('express');
const router = express.Router();

const employees = require("../validations/employees.validation");

router.get('/employees', ensureToken, employees.validate_getEmployees);
router.get('/employee/:id', ensureToken, employees.validate_getEmployeeById);
router.post('/employee', ensureToken, employees.validate_createEmployee);
router.put('/employee', ensureToken, employees.validate_updateEmployee);

function ensureToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports = router;
