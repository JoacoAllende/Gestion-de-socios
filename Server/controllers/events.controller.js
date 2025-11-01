const eventosController = {};
const mysqlConnection = require('../database');

eventosController.getEvents = (req, res) => {
  try {
    const sql = `
      SELECT 
        e.id,
        e.descripcion,
        DATE_FORMAT(e.fecha, '%d-%m-%Y') AS fecha,
        e.finalizado,
        e.observaciones,
        COALESCE(SUM(em.monto), 0) AS total_movimientos,
        COUNT(em.id) AS cantidad_movimientos
      FROM evento e
      LEFT JOIN evento_movimiento em ON e.id = em.evento_id
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

eventosController.getEventById = (req, res) => {
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
      if (rows.length === 0) return res.status(404).json({ message: "Event no encontrado" });
      res.json(rows[0]);
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

eventosController.createEvent = (req, res) => {
  try {
    const { descripcion, fecha, observaciones } = req.body;
    
    const sql = `
      INSERT INTO evento (descripcion, fecha, observaciones)
      VALUES (?, ?, ?)
    `;

    mysqlConnection.query(sql, [descripcion, fecha, observaciones || null], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, status: "Event creado" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

eventosController.updateEvent = (req, res) => {
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
      res.json({ status: "Event actualizado" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = eventosController;