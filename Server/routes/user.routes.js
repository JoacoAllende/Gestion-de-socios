const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { ensureToken } = require('../middleware/auth');
const user = require('../validations/user.validation');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { error: 'Demasiados intentos de login. Intente de nuevo en 15 minutos.' }
});

router.post('/register', ensureToken, user.validate_registerUser);
router.post('/login', loginLimiter, user.validate_loginUser)

module.exports = router;