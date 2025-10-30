const statisticsValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'TheSecretKey';
const statisticsController = require('../controllers/statistics.controller');

statisticsValidator.validate_getIncomeByMembershipCard = (req, res) => {
    verifyTokenAndExecute(req, res, statisticsController.getIncomeByMembershipCard);
}

function verifyTokenAndExecute(req, res, nextFn) {
    jwt.verify(req.token, SECRET_KEY, (err) => {
        if (err) {
            return res.sendStatus(403);
        }
        nextFn(req, res);
    });
}

module.exports = statisticsValidator;