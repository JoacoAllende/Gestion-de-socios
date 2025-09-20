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

dailyBoxController.addMovement = (req, res) => {
  try {
    const { tipo, concepto, monto, medio_pago } = req.body;

    const sqlSaldo = "SELECT saldo FROM caja_diaria ORDER BY id DESC LIMIT 1";

    mysqlConnection.query(sqlSaldo, (err, rows) => {
      if (err) return res.status(500).json(err);

      let saldoAnterior = rows.length > 0 ? rows[0].saldo : 0;
      let nuevoSaldo = saldoAnterior;

      if (medio_pago === "EFECTIVO") {
        if (tipo === "INGRESO") {
          nuevoSaldo += parseFloat(monto);
        } else if (tipo === "EGRESO") {
          nuevoSaldo -= parseFloat(monto);
        }
      }

      const fecha = new Date().toISOString().split('T')[0];

      const insertSql = `
        INSERT INTO caja_diaria (fecha, tipo, concepto, monto, medio_pago, saldo)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      mysqlConnection.query(
        insertSql,
        [fecha, tipo, concepto, monto, medio_pago, nuevoSaldo],
        (err, result) => {
          if (err) return res.status(500).json(err);
          res.json({ id: result.insertId, saldo: nuevoSaldo });
        }
      );
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = dailyBoxController;
