const express = require('express');
const router = express.Router();
const { ensureToken } = require('../middleware/auth');

const statistics = require("../validations/statistics.validation");

router.get('/income-by-card/:mes/:anio', ensureToken, statistics.validate_getIncomeByMembershipCard);

module.exports = router;