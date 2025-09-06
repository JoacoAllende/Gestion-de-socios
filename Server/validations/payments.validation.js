const paymentsValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'TheSecretKey';
const paymentsController = require('../controllers/payments.controller');

paymentsValidator.validate_updatePayments = (req, res) => {
    paymentsController.updatePayments(req, res);
}

module.exports = paymentsValidator;