const membershipValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'TheSecretKey';
const membershipController = require('../controllers/membership.controller');

membershipValidator.validate_getMemberships = (req, res) => {
    membershipController.getMemberships(req, res);
}

membershipValidator.validate_getDischargedMemberships = (req, res) => {
    membershipController.getDischargedMemberships(req, res);
}

membershipValidator.validate_getFutbolCategories = (req, res) => {
    membershipController.getFutbolCategories(req, res);
}

membershipValidator.validate_getBasquetCategories = (req, res) => {
    membershipController.getBasquetCategories(req, res);
}

membershipValidator.validate_getPaletaCategories = (req, res) => {
    membershipController.getPaletaCategories(req, res);
}

membershipValidator.validate_getMembershipCard = (req, res) => {
    membershipController.getMembershipCard(req, res);
}

membershipValidator.validate_getMembership = (req, res) => {
    membershipController.getMembership(req, res);
}

membershipValidator.validate_createMembership = (req, res) => {
    membershipController.createMembership(req, res);
    // jwt.verify(req.token, SECRET_KEY, (err) => {
    //     if (!err) {
    //         goleadorController.createGoleador(req, res);
    //     } else {
    //         res.sendStatus(403);
    //     }
    // })
}

membershipValidator.validate_updateMembership = (req, res) => {
    membershipController.updateMembership(req, res);
    // jwt.verify(req.token, SECRET_KEY, (err) => {
    //     if (!err) {
    //         goleadorController.createGoleador(req, res);
    //     } else {
    //         res.sendStatus(403);
    //     }
    // })
}

// goleadorValidator.validate_getEquipos = (req, res) => {
//     jwt.verify(req.token, SECRET_KEY, (err) => {
//         if (!err) {
//             goleadorController.getEquipos(req, res);
//         } else {
//             res.sendStatus(403);
//         }
//     })
// }

// goleadorValidator.validate_updateGoleador = (req, res) => {
//     jwt.verify(req.token, SECRET_KEY, (err) => {
//         if (!err) {
//             goleadorController.updateGoleador(req, res);
//         } else {
//             res.sendStatus(403);
//         }
//     })
// }

// goleadorValidator.validate_deleteGoleador = (req, res) => {
//     jwt.verify(req.token, SECRET_KEY, (err) => {
//         if (!err) {
//             goleadorController.deleteGoleador(req, res);
//         } else {
//             res.sendStatus(403);
//         }
//     })
// }

module.exports = membershipValidator;