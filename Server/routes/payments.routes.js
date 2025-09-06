const express = require('express');
const router = express.Router();

const payments = require("../validations/payments.validation");

router.put('/payments', payments.validate_updatePayments);

module.exports = router;