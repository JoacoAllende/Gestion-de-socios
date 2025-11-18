const eventsController = {};
const mysqlConnection = require('../database');

// ==================== EVENTS ====================

eventsController.getEvents = (req, res) => {
  try {
    const sql = `
      SELECT 
        e.id,
        e.descripcion,
        DATE_FORMAT(e.fecha, '%d-%m-%Y') AS fecha,
        e.finalizado,
        e.observaciones,
        COUNT(DISTINCT em.id) AS cantidad_movimientos,
        COALESCE(SUM(CASE WHEN md.tipo = 'INGRESO' THEN md.monto ELSE 0 END), 0) AS total_ingresos,
        COALESCE(SUM(CASE WHEN md.tipo = 'EGRESO' THEN md.monto ELSE 0 END), 0) AS total_egresos,
        COALESCE(
          SUM(CASE WHEN md.tipo = 'INGRESO' THEN md.monto ELSE 0 END) - 
          SUM(CASE WHEN md.tipo = 'EGRESO' THEN md.monto ELSE 0 END), 
          0
        ) AS total_movimientos
      FROM evento e
      LEFT JOIN evento_movimiento em ON e.id = em.evento_id
      LEFT JOIN movimiento_detalle md ON em.id = md.movimiento_id
      GROUP BY e.id
      ORDER BY e.finalizado ASC, e.fecha DESC, e.id DESC
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

eventsController.getEventById = (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        id,
        descripcion,
        fecha,
        finalizado,
        observaciones
      FROM evento 
      WHERE id = ?
    `;

    mysqlConnection.query(sql, [id], (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0) return res.status(404).json({ message: "Evento no encontrado" });
      res.json(rows[0]);
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

eventsController.createEvent = (req, res) => {
  try {
    const { descripcion, fecha, observaciones } = req.body;
    
    const sql = `
      INSERT INTO evento (descripcion, fecha, observaciones)
      VALUES (?, ?, ?)
    `;

    mysqlConnection.query(sql, [descripcion, fecha, observaciones || null], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, status: "Evento creado" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

eventsController.updateEvent = (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, fecha, observaciones, finalizado } = req.body;

    const sql = `
      UPDATE evento 
      SET descripcion = ?, fecha = ?, observaciones = ?, finalizado = ?
      WHERE id = ?
    `;

    mysqlConnection.query(sql, [descripcion, fecha, observaciones || null, finalizado || 0, id], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ status: "Evento actualizado" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// ==================== MOVEMENTS ====================

eventsController.getMovementsByEvent = (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        em.id,
        em.evento_id,
        em.concepto,
        em.monto,
        DATE_FORMAT(em.fecha, '%d-%m-%Y') AS fecha,
        em.observaciones,
        COUNT(md.id) AS cantidad_detalles,
        COALESCE(SUM(CASE WHEN md.tipo = 'INGRESO' THEN md.monto ELSE 0 END), 0) AS total_ingresos,
        COALESCE(SUM(CASE WHEN md.tipo = 'EGRESO' THEN md.monto ELSE 0 END), 0) AS total_egresos,
        COALESCE(SUM(CASE WHEN md.tipo = 'EGRESO' AND md.pagado = 1 THEN md.monto ELSE 0 END), 0) AS egresos_pagados
      FROM evento_movimiento em
      LEFT JOIN movimiento_detalle md ON em.id = md.movimiento_id
      WHERE em.evento_id = ?
      GROUP BY em.id
      ORDER BY em.fecha DESC, em.id DESC
    `;

    mysqlConnection.query(sql, [id], (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

eventsController.createMovement = (req, res) => {
  try {
    const { id } = req.params;
    const { concepto, monto, fecha, observaciones, detalle } = req.body;

    const sqlMovement = `
      INSERT INTO evento_movimiento (evento_id, concepto, monto, fecha, observaciones)
      VALUES (?, ?, ?, ?, ?)
    `;

    mysqlConnection.query(
      sqlMovement,
      [id, concepto, monto, fecha, observaciones || null],
      (err, result) => {
        if (err) return res.status(500).json(err);
        
        const movementId = result.insertId;

        if (detalle) {
          const sqlDetail = `
            INSERT INTO movimiento_detalle (movimiento_id, tipo, concepto, monto, medio_pago, pagado, fecha_pago, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const isPagado = detalle.tipo === 'INGRESO' ? 1 : (detalle.pagado || 0);
          const realFechaPago = (isPagado && detalle.fecha_pago && detalle.fecha_pago !== '') 
            ? detalle.fecha_pago 
            : null;

          mysqlConnection.query(
            sqlDetail,
            [
              movementId,
              detalle.tipo,
              detalle.concepto,
              detalle.monto,
              detalle.medio_pago || 'EFECTIVO',
              isPagado,
              realFechaPago,
              detalle.observaciones || null
            ],
            (err2) => {
              if (err2) return res.status(500).json(err2);
              res.json({ id: movementId, status: "Movimiento creado con detalle" });
            }
          );
        } else {
          const sqlDetail = `
            INSERT INTO movimiento_detalle (movimiento_id, tipo, concepto, monto, medio_pago, pagado, fecha_pago, observaciones)
            VALUES (?, 'EGRESO', ?, ?, 'EFECTIVO', 0, NULL, ?)
          `;

          mysqlConnection.query(
            sqlDetail,
            [movementId, concepto, monto, observaciones || null],
            (err2) => {
              if (err2) return res.status(500).json(err2);
              res.json({ id: movementId, status: "Movimiento creado con detalle por defecto" });
            }
          );
        }
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

eventsController.updateMovement = (req, res) => {
  try {
    const { movementId } = req.params;
    const { concepto, monto, fecha, observaciones } = req.body;

    const sql = `
      UPDATE evento_movimiento 
      SET concepto = ?, monto = ?, fecha = ?, observaciones = ?
      WHERE id = ?
    `;

    mysqlConnection.query(
      sql,
      [concepto, monto, fecha, observaciones || null, movementId],
      (err) => {
        if (err) return res.status(500).json(err);
        res.json({ status: "Movimiento actualizado" });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

eventsController.deleteMovement = (req, res) => {
  try {
    const { movementId } = req.params;
    const sql = "DELETE FROM evento_movimiento WHERE id = ?";

    mysqlConnection.query(sql, [movementId], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ status: "Movimiento eliminado" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// ==================== DETAILS ====================

eventsController.getDetailsByMovement = (req, res) => {
  try {
    const { movementId } = req.params;
    
    const sql = `
      SELECT 
        md.id,
        md.movimiento_id,
        em.evento_id, 
        md.tipo,
        md.concepto,
        md.monto,
        md.medio_pago,
        md.pagado,
        DATE_FORMAT(md.fecha_pago, '%d-%m-%Y') AS fecha_pago,
        md.observaciones
      FROM movimiento_detalle md
      INNER JOIN evento_movimiento em ON md.movimiento_id = em.id
      WHERE md.movimiento_id = ?
      ORDER BY md.fecha_pago DESC, md.id DESC
    `;

    mysqlConnection.query(sql, [movementId], (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

eventsController.createDetail = (req, res) => {
  try {
    const { movementId } = req.params;
    const { tipo, concepto, monto, medio_pago, pagado, fecha_pago, observaciones } = req.body;

    const sql = `
      INSERT INTO movimiento_detalle (movimiento_id, tipo, concepto, monto, medio_pago, pagado, fecha_pago, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const isPagado = tipo === 'INGRESO' ? 1 : (pagado || 0);
    const realFechaPago = (isPagado && fecha_pago && fecha_pago !== '') 
      ? fecha_pago 
      : null;

    mysqlConnection.query(
      sql,
      [movementId, tipo, concepto, monto, medio_pago || 'EFECTIVO', isPagado, realFechaPago, observaciones || null],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ id: result.insertId, status: "Detalle creado" });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

eventsController.updateDetail = (req, res) => {
  try {
    const { detailId } = req.params;
    const { tipo, concepto, monto, medio_pago, pagado, fecha_pago, observaciones } = req.body;

    const sql = `
      UPDATE movimiento_detalle 
      SET tipo = ?, concepto = ?, monto = ?, medio_pago = ?, pagado = ?, fecha_pago = ?, observaciones = ?
      WHERE id = ?
    `;

    let isPagado;
    if (tipo === 'INGRESO') {
      isPagado = 1;
    } else if (pagado !== undefined && pagado !== null) {
      isPagado = Number(pagado) === 1 ? 1 : 0;
    } else {
      const sqlGet = "SELECT pagado FROM movimiento_detalle WHERE id = ?";
      mysqlConnection.query(sqlGet, [detailId], (errGet, rows) => {
        if (errGet) return res.status(500).json(errGet);
        isPagado = rows[0]?.pagado || 0;
        
        proceedUpdate(isPagado);
      });
      return;
    }

    proceedUpdate(isPagado);

    function proceedUpdate(pagadoValue) {
      let realFechaPago = null;
      if (fecha_pago && fecha_pago !== '') {
        realFechaPago = fecha_pago;
      } else if (tipo === 'INGRESO') {
        realFechaPago = new Date().toISOString().split('T')[0];
      }

      mysqlConnection.query(
        sql,
        [tipo, concepto, monto, medio_pago, pagadoValue, realFechaPago, observaciones || null, detailId],
        (err) => {
          if (err) return res.status(500).json(err);
          res.json({ status: "Detalle actualizado" });
        }
      );
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

eventsController.deleteDetail = (req, res) => {
  try {
    const { detailId } = req.params;
    const sql = "DELETE FROM movimiento_detalle WHERE id = ?";

    mysqlConnection.query(sql, [detailId], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ status: "Detalle eliminado" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = eventsController;