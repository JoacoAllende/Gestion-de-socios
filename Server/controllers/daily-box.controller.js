const dailyBoxController = {};
const mysqlConnection = require('../database');

dailyBoxController.getDailyBox = (req, res) => {
  try {
    const { anio } = req.params;
    
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
          WHEN medio_pago = 'TRANSFERENCIA' 
          THEN CASE 
                WHEN tipo = 'INGRESO' THEN monto
                WHEN tipo = 'EGRESO' THEN -monto
                ELSE 0
              END
          ELSE 0
        END AS monto_transferencia
      FROM caja_diaria
      WHERE YEAR(fecha) = ?
      ORDER BY id DESC
    `;

    mysqlConnection.query(sql, [anio], (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.json(results);
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

dailyBoxController.getMovementById = (req, res) => {
  try {
    const { id } = req.params;
    const sql = "SELECT * FROM caja_diaria WHERE id = ?";
    mysqlConnection.query(sql, [id], (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0) return res.status(404).json({ message: "Movimiento no encontrado" });
      res.json(rows[0]);
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
          res.json({ id: result.insertId, saldo: nuevoSaldo, status: "Movimiento creado" });
        }
      );
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

dailyBoxController.updateMovement = (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, concepto, monto, medio_pago } = req.body;

    const getSql = "SELECT * FROM caja_diaria WHERE id = ?";

    mysqlConnection.query(getSql, [id], (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0) return res.status(404).json({ message: "Movimiento no encontrado" });

      const old = rows[0];

      let impactoAnterior = 0;
      if (old.medio_pago === "EFECTIVO") {
        impactoAnterior = old.tipo === "INGRESO" ? +old.monto : -old.monto;
      }

      let impactoNuevo = 0;
      if (medio_pago === "EFECTIVO") {
        impactoNuevo = tipo === "INGRESO" ? +monto : -monto;
      }

      const diferencia = impactoNuevo - impactoAnterior;

      const updateSql = `
        UPDATE caja_diaria 
        SET tipo = ?, concepto = ?, monto = ?, medio_pago = ?
        WHERE id = ?
      `;

      mysqlConnection.query(updateSql, [tipo, concepto, monto, medio_pago, id], (err) => {
        if (err) return res.status(500).json(err);

        const adjustSql = `
          UPDATE caja_diaria 
          SET saldo = saldo + ?
          WHERE id >= ?
        `;

        mysqlConnection.query(adjustSql, [diferencia, id], (err2) => {
          if (err2) return res.status(500).json(err2);
          res.json({diferencia, status: "Movimiento actualizado" });
        });
      });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = dailyBoxController;
