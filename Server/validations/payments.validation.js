const paymentsValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'TheSecretKey';
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

function verifyTokenAndExecute(req, res, nextFn) {
    jwt.verify(req.token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }
        nextFn(req, res);
    });
}

module.exports = paymentsValidator;