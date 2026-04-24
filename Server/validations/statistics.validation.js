const statisticsValidator = {};
const { verifyTokenAndExecute } = require('../middleware/auth');
const statisticsController = require('../controllers/statistics.controller');

statisticsValidator.validate_getIncomeByMembershipCard = (req, res) => {
    verifyTokenAndExecute(req, res, statisticsController.getIncomeByMembershipCard);
}

module.exports = statisticsValidator;