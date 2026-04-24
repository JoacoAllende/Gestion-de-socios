const express = require('express');
const router = express.Router();
const { ensureToken } = require('../middleware/auth');

const dailyBox = require("../validations/daily-box.validation");

router.get('/daily-box/:anio', ensureToken, dailyBox.validate_getDailyBox);
router.get('/daily-box-movement/:id', ensureToken, dailyBox.validate_getMovementById);
router.post('/daily-box', ensureToken, dailyBox.validate_addMovement);
router.put('/daily-box/:id', ensureToken, dailyBox.validate_updateMovement);

module.exports = router;
