const membershipValidator = {};
const { verifyTokenAndExecute } = require('../middleware/auth');
const membershipController = require('../controllers/membership.controller');

membershipValidator.validate_getMemberships = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.getMemberships);
};

membershipValidator.validate_getDischargedMemberships = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.getDischargedMemberships);
};

membershipValidator.validate_getFutbolCategories = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.getFutbolCategories);
};

membershipValidator.validate_getBasquetCategories = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.getBasquetCategories);
};

membershipValidator.validate_getPaletaCategories = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.getPaletaCategories);
};

membershipValidator.validate_getActiveMemberships = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.getActiveMemberships);
}

membershipValidator.validate_getMembershipCard = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.getMembershipCard);
};

membershipValidator.validate_getMembership = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.getMembership);
};

membershipValidator.validate_createMembership = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.createMembership);
};

membershipValidator.validate_updateMembership = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.updateMembership);
};

membershipValidator.validate_getMembershipStateByDni = (req, res) => {
    membershipController.getMembershipStateByDni(req, res);
};

module.exports = membershipValidator;
