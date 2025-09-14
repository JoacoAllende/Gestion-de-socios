const dailyBoxController = {};
const mysqlConnection = require('../database');

dailyBoxController.getDailyBox = (req, res) => {
  try {
    const sql = `
      SELECT *
      FROM caja_diaria
      WHERE YEAR(fecha) = 2025
      ORDER BY fecha DESC, id DESC
    `;

    mysqlConnection.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.json(results);
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = dailyBoxController;
