const express = require('express');
const router = express.Router();
const user = require('../validations/user.validation');

router.post('/register', user.validar_registerUser);
router.post('/login', user.validar_loginUser)

module.exports = router;