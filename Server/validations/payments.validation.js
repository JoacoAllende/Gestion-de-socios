const paymentsValidator = {};
const { verifyTokenAndExecute } = require('../middleware/auth');
const paymentsController = require('../controllers/payments.controller');

paymentsValidator.validate_updatePayments = (req, res) => {
    verifyTokenAndExecute(req, res, paymentsController.updatePayments);
}

paymentsValidator.validate_initializeYear = (req, res) => {
  verifyTokenAndExecute(req, res, paymentsController.initializeYear);
};

paymentsValidator.validate_recalculatePayments = (req, res) => {
  verifyTokenAndExecute(req, res, paymentsController.recalculatePayments);
};

module.exports = paymentsValidator;