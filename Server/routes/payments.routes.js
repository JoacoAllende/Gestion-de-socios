const express = require('express');
const router = express.Router();
const { ensureToken } = require('../middleware/auth');

const payments = require("../validations/payments.validation");

router.put('/payments/recalculate', ensureToken, payments.validate_recalculatePayments);
router.post('/payments/initialize-year/:anio', ensureToken, payments.validate_initializeYear);
router.put('/payments/:anio', ensureToken, payments.validate_updatePayments);

module.exports = router;