const dailyBoxController = {};
const mysqlConnection = require('../database');

dailyBoxController.getDailyBox = (req, res) => {
  try {
    const sql = `
      SELECT 
        id,
        DATE_FORMAT(fecha, '%d-%m-%Y') AS fecha,
        concepto,
        saldo,
        CASE 
          WHEN tipo = 'INGRESO' AND medio_pago = 'EFECTIVO' 
          THEN monto ELSE 0 
        END AS monto_ingreso,
        CASE 
          WHEN tipo = 'EGRESO' AND medio_pago = 'EFECTIVO' 
          THEN monto ELSE 0 
        END AS monto_egreso,
        CASE 
          WHEN tipo = 'INGRESO' AND medio_pago = 'TRANSFERENCIA' 
          THEN monto ELSE 0 
        END AS monto_transferencia,
        CASE 
          WHEN tipo = 'EGRESO' AND medio_pago = 'TRANSFERENCIA' 
          THEN -monto ELSE 0 
        END AS monto_transferencia
      FROM caja_diaria
      WHERE YEAR(fecha) = 2025
      ORDER BY id DESC
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
