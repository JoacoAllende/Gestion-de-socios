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

module.exports = employeeController;
