const paymentsValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'REMOVED';
const paymentsController = require('../controllers/payments.controller');

paymentsValidator.validar_updatePayments = (req, res) => {
    paymentsController.updatePayments(req, res);
}

module.exports = paymentsValidator;