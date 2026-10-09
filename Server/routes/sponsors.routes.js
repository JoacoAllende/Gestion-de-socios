const express = require('express');
const router = express.Router();
const { ensureToken } = require('../middleware/auth');

const sponsors = require("../validations/sponsors.validation");

router.post('/sponsors/initialize-year/:anio', ensureToken, sponsors.validate_initializeYear);
router.put('/sponsors/payments/:anio', ensureToken, sponsors.validate_updatePayments);
router.get('/sponsors/:tipo/:anio', ensureToken, sponsors.validate_getSponsors);
router.get('/sponsor/:id', ensureToken, sponsors.validate_getSponsorById);
router.post('/sponsor/:tipo/:anio', ensureToken, sponsors.validate_createSponsor);
router.put('/sponsor/:id/:anio', ensureToken, sponsors.validate_updateSponsor);

module.exports = router;
