const membershipValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'TheSecretKey';
const membershipController = require('../controllers/membership.controller');

membershipValidator.validar_getMemberships = (req, res) => {
    membershipController.getMemberships(req, res);
}

membershipValidator.validar_getCategories = (req, res) => {
    membershipController.getCategories(req, res);
}

membershipValidator.validar_getMembership = (req, res) => {
    membershipController.getMembership(req, res);
}

membershipValidator.validar_createMembership = (req, res) => {
    membershipController.createMembership(req, res);
    // jwt.verify(req.token, SECRET_KEY, (err) => {
    //     if (!err) {
    //         goleadorController.createGoleador(req, res);
    //     } else {
    //         res.sendStatus(403);
    //     }
    // })
}

membershipValidator.validar_updateMembership = (req, res) => {
    membershipController.updateMembership(req, res);
    // jwt.verify(req.token, SECRET_KEY, (err) => {
    //     if (!err) {
    //         goleadorController.createGoleador(req, res);
    //     } else {
    //         res.sendStatus(403);
    //     }
    // })
}

// goleadorValidator.validar_getEquipos = (req, res) => {
//     jwt.verify(req.token, SECRET_KEY, (err) => {
//         if (!err) {
//             goleadorController.getEquipos(req, res);
//         } else {
//             res.sendStatus(403);
//         }
//     })
// }

// goleadorValidator.validar_updateGoleador = (req, res) => {
//     jwt.verify(req.token, SECRET_KEY, (err) => {
//         if (!err) {
//             goleadorController.updateGoleador(req, res);
//         } else {
//             res.sendStatus(403);
//         }
//     })
// }

// goleadorValidator.validar_deleteGoleador = (req, res) => {
//     jwt.verify(req.token, SECRET_KEY, (err) => {
//         if (!err) {
//             goleadorController.deleteGoleador(req, res);
//         } else {
//             res.sendStatus(403);
//         }
//     })
// }

module.exports = membershipValidator;