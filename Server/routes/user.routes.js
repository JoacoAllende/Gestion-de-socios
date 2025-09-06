const express = require('express');
const router = express.Router();
const user = require('../validations/user.validation');

router.post('/register', user.validate_registerUser);
router.post('/login', user.validate_loginUser)

module.exports = router;