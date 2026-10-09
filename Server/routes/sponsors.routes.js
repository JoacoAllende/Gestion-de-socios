const express = require('express');
const router = express.Router();
const { ensureToken } = require('../middleware/auth');

const sponsors = require("../validations/sponsors.validation");

router.post('/agreements/initialize-year/:anio', ensureToken, sponsors.validate_initializeYear);
router.put('/agreements/payments/:anio', ensureToken, sponsors.validate_updatePayments);
router.get('/agreements/:tipo/:anio', ensureToken, sponsors.validate_getSponsors);
router.get('/agreement/:id', ensureToken, sponsors.validate_getSponsorById);
router.post('/agreement/:tipo/:anio', ensureToken, sponsors.validate_createSponsor);
router.put('/agreement/:id/:anio', ensureToken, sponsors.validate_updateSponsor);

module.exports = router;
