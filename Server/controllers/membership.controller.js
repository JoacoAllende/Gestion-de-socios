const membershipController = {};

const mysqlConnection = require('../database');

membershipController.getMemberships = async (req, res, next) => {
  const anio = 2025;
  const meses = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];

  const cases = meses.map((m, i) => `
    MAX(
      CASE 
        WHEN p.mes = ${i+1} AND p.pagado = TRUE  THEN p.monto
        WHEN p.mes = ${i+1} AND p.pagado = FALSE THEN 0
        ELSE NULL
      END
    ) AS ${m}
  `).join(',\n');

  const query = `
    SELECT 
        s.id AS socioId,
        s.nombre,
        s.cuota_activa,
        s.cuota_pasiva,
        s.descuento_familiar,
        c.nombre AS categoria,
        MAX(CASE WHEN a.nombre = 'Futbol'  THEN 1 ELSE 0 END) AS futbol,
        MAX(CASE WHEN a.nombre = 'Paleta'  THEN 1 ELSE 0 END) AS paleta,
        MAX(CASE WHEN a.nombre = 'Basquet' THEN 1 ELSE 0 END) AS basquet,
        ${cases}
    FROM socio s
    LEFT JOIN categoria c ON s.categoria_id = c.id
    LEFT JOIN socio_actividad sa ON sa.socio_id = s.id
    LEFT JOIN actividad a ON a.id = sa.actividad_id
    LEFT JOIN pago p ON p.socio_id = s.id AND p.anio = ?
    GROUP BY s.id, s.nombre, s.dni, s.activo, c.nombre
  `;

  mysqlConnection.query(query, [anio], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      res.status(500).json(err);
    }
  });
};




// goleadoresController.getEquipos = async (req, res, next) => {
//     const { to: torneo, a: anio } = req.params;
//     const query = `SELECT id, nombre, grupo FROM equipo WHERE torneo = ${torneo} AND anio = ${anio};`
//     mysqlConnection.query(query, (err, rows, fields) => {
//         if (!err) {
//             res.json(rows);
//         } else {
//             res.json(err.errno);
//         }
//     })
// };

// goleadoresController.createGoleador = (req, res) => {
//     const goleador = req.body;
//     const {to, a} = req.params;
//     const query = `INSERT INTO goleadores (nombre, apellido, goles, id_equipo, anio, torneo) VALUES ("${goleador.nombre}","${goleador.apellido}",${goleador.goles}, ${goleador.id_equipo},${a}, ${to});`;
//     mysqlConnection.query(query, (err) => {
//         if(!err) {
//             res.json({
//                 'status' : 'created'
//             })
//         } else {
//             res.json(err.errno);
//         }
//     })
// };

// goleadoresController.updateGoleador = (req, res) => {
//     const goleador = req.body;
//     const query = `UPDATE goleadores SET nombre = '${goleador.nombre}', apellido = '${goleador.apellido}', goles = ${goleador.goles}, id_equipo = ${goleador.id_equipo} WHERE id = ${goleador.id};`
//     mysqlConnection.query(query, (err) => {
//         if (!err) {
//             res.json({
//                 'status': 'updated'
//             });
//         } else {
//             res.json(err.errno);
//         }
//     })
// }

// goleadoresController.deleteGoleador = (req, res) => {
//     const id = req.params.id;
//     const query = `DELETE FROM goleadores WHERE id = ${id};`
//     mysqlConnection.query(query, (err) => {
//         if (!err) {
//             res.json({
//                 'status': 'updated'
//             });
//         } else {
//             res.json(err.errno);
//         }
//     })
// }
 
module.exports = membershipController;