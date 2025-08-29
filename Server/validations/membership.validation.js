const membershipValidator = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'TheSecretKey';
const membershipController = require('../controllers/membership.controller');

// goleadorValidator.validar_createGoleador = (req, res) => {
//     jwt.verify(req.token, SECRET_KEY, (err) => {
//         if (!err) {
//             goleadorController.createGoleador(req, res);
//         } else {
//             res.sendStatus(403);
//         }
//     })
// }

membershipValidator.validar_getMemberships = (req, res) => {
    membershipController.getMemberships(req, res);
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