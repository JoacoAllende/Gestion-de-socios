const employeeController = {};
const mysqlConnection = require('../database');

employeeController.getEmployees = async (req, res) => {
  try {
    const anio = 2025;
    const meses = [
      'enero','febrero','marzo','abril','mayo','junio',
      'julio','agosto','septiembre','octubre','noviembre','diciembre'
    ];

    const cases = meses.map((m, i) => `
      MAX(
        CASE 
          WHEN s.mes = ${i + 1} AND s.pagado = TRUE THEN s.monto_mes
          WHEN s.mes = ${i + 1} AND s.pagado = FALSE THEN 0
          ELSE NULL
        END
      ) AS ${m}
    `).join(',\n');

    const query = `
      SELECT 
        e.id,
        e.nombre,
        e.monto_base AS monto,
        ${cases}
      FROM empleado e
      LEFT JOIN sueldo s ON s.empleado_id = e.id AND s.anio = ?
      GROUP BY e.id, e.nombre
      ORDER BY e.nombre ASC
    `;

    mysqlConnection.query(query, [anio], (err, rows) => {
      if (!err) {
        res.json(rows);
      } else {
        res.status(500).json(err);
      }
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

employeeController.getEmployeeById = (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        e.id,
        e.nombre,
        e.monto_base AS monto,
        e.detalles,
        e.activo
      FROM empleado e
      WHERE e.id = ?
    `;

    mysqlConnection.query(query, [id], (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
      res.json(rows[0]);
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

employeeController.createEmployee = (req, res) => {
  try {
    const { nombre, monto, detalles, mes_alta } = req.body;
    const anio = 2025;

    if (!nombre || !monto || !mes_alta) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const empleadoQuery = `
      INSERT INTO empleado (nombre, monto_base, detalles, activo)
      VALUES (?, ?, ?, TRUE)
    `;

    mysqlConnection.query(
      empleadoQuery,
      [nombre, monto, detalles || null],
      (err, result) => {
        if (err) return res.status(500).json(err);

        const empleadoId = result.insertId;

        const sueldoValues = [];
        for (let mes = mes_alta; mes <= 12; mes++) {
          sueldoValues.push([empleadoId, anio, mes, false]);
        }

        if (sueldoValues.length === 0) {
          return res.json({ status: 'Empleado creado', empleadoId });
        }

        const sueldoQuery = `
          INSERT INTO sueldo (empleado_id, anio, mes, pagado)
          VALUES ?
        `;

        mysqlConnection.query(sueldoQuery, [sueldoValues], (err2) => {
          if (err2) return res.status(500).json(err2);
          res.json({ status: 'Empleado creado', empleadoId });
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

employeeController.updateEmployee = (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, monto, detalles, mes_alta } = req.body;
    const anio = 2025;

    if (!id || !nombre || !monto || !mes_alta) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const updateEmpleadoQuery = `
      UPDATE empleado
      SET nombre = ?, monto_base = ?, detalles = ?
      WHERE id = ?
    `;

    mysqlConnection.query(
      updateEmpleadoQuery,
      [nombre, monto, detalles || null, id],
      (err) => {
        if (err) return res.status(500).json(err);

        const updateSueldosQuery = `
          UPDATE sueldo
          SET monto_mes = ?
          WHERE empleado_id = ? AND anio = ? AND mes >= ?
        `;

        mysqlConnection.query(
          updateSueldosQuery,
          [monto, id, anio, mes_alta],
          (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ status: 'Empleado actualizado', empleadoId: id });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = employeeController;
