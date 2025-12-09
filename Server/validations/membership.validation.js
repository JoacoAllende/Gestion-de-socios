const membershipValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'TheSecretKey';
const membershipController = require('../controllers/membership.controller');

membershipValidator.validate_getMemberships = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.getMemberships);
};

membershipValidator.validate_getDischargedMemberships = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.getDischargedMemberships);
};

membershipValidator.validate_getFutbolCategories = (req, res) => {
    membershipController.getFutbolCategories(req, res);
};

membershipValidator.validate_getBasquetCategories = (req, res) => {
    membershipController.getBasquetCategories(req, res);
};

membershipValidator.validate_getPaletaCategories = (req, res) => {
    membershipController.getPaletaCategories(req, res);
};

membershipValidator.validate_getActiveMemberships = (req, res) => {
    verifyTokenAndExecute(req, res, membershipController.getActiveMemberships);
}

membershipValidator.validate_getMembershipCard = (req, res) => {
    membershipController.getMembershipCard(req, res);
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

function verifyTokenAndExecute(req, res, nextFn) {
    jwt.verify(req.token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }
        nextFn(req, res);
    });
}

module.exports = membershipValidator;
