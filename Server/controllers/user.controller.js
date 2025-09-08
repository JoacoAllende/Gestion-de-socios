const userCtrl = {};
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'TheSecretKey';
const bcrypt = require('bcryptjs');

const mysqlConnection = require('../database');

userCtrl.registerUser = (req, res) => {
    const { nombre, contraseña } = req.body;
    if (!nombre || !contraseña) {
        return res.status(400).json({ status: 'Faltan datos' });
    }
    const hashedPassword = bcrypt.hashSync(contraseña, 10);
    const query = `INSERT INTO usuario (nombre, contraseña) VALUES (?, ?)`;
    mysqlConnection.query(query, [nombre, hashedPassword], (err) => {
        if (!err) {
            res.json({ status: 'created' });
        } else {
            res.status(500).json({ error: err.message });
        }
    });
};

userCtrl.loginUser = (req, res) => {
    const { nombre, contraseña } = req.body;
    if (!nombre || !contraseña) {
        return res.status(400).json({ status: 'Faltan datos' });
    }
    const query = `SELECT id, contraseña FROM usuario WHERE nombre = ?`;
    mysqlConnection.query(query, [nombre], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const logUser = rows[0];
        if (!logUser) {
            return res.status(401).json({ status: 'Usuario o contraseña incorrectos' });
        }

        const resultPassword = bcrypt.compareSync(contraseña, logUser.contraseña);
        if (!resultPassword) {
            return res.status(401).json({ status: 'Usuario o contraseña incorrectos' });
        }

        const id = logUser.id;
        const expiresIn = 4 * 60 * 60;
        const accessToken = jwt.sign({ id }, SECRET_KEY, { expiresIn });

        res.json({
            accessToken,
            expiresIn,
            message: 'Login exitoso',
        });
    });
};

module.exports = userCtrl;
