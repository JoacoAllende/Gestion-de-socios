const membershipController = {};

const mysqlConnection = require('../database');

membershipController.getMembership = async (req, res, next) => {
  const { id } = req.params;

  const socioQuery = 'SELECT * FROM socio WHERE id = ?';
  const actividadesQuery = `
    SELECT a.nombre 
    FROM socio_actividad sa
    INNER JOIN actividad a ON sa.actividad_id = a.id
    WHERE sa.socio_id = ?
  `;

  mysqlConnection.query(socioQuery, [id], (err, socioRows) => {
    if (err) return res.status(500).json(err);

    if (socioRows.length === 0) {
      return res.status(404).json({ message: 'Socio no encontrado' });
    }

    const socio = socioRows[0];

    mysqlConnection.query(actividadesQuery, [id], (err, actRows) => {
      if (err) return res.status(500).json(err);

      const actividades = {
        futbol: false,
        basquet: false,
        paleta: false,
      };

      actRows.forEach(row => {
        if (row.nombre.toLowerCase() === 'futbol') actividades.futbol = true;
        if (row.nombre.toLowerCase() === 'basquet') actividades.basquet = true;
        if (row.nombre.toLowerCase() === 'paleta') actividades.paleta = true;
      });

      res.json({
        ...socio,
        ...actividades
      });
    });
  });
};

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

membershipController.createMembership = async (req, res) => {
    try {
        const {
            nombre,
            dni,
            cuota_activa,
            cuota_pasiva,
            futbol,
            paleta,
            basquet
        } = req.body;

        const socioQuery = `
            INSERT INTO socio (nombre, dni, cuota_activa, cuota_pasiva, activo, genero)
            VALUES (?, ?, ?, ?, TRUE, 'F')`; // ajustar genero según tu necesidad

        mysqlConnection.query(
            socioQuery,
            [nombre, dni || null, !!cuota_activa, !!cuota_pasiva],
            (err, result) => {
                if (err) {
                    return res.status(500).json(err);
                }
                const socioId = result.insertId;
                const actividades = [];
                if (futbol) actividades.push(1);
                if (paleta) actividades.push(2);
                if (basquet) actividades.push(3);

                if (actividades.length === 0) {
                    return res.json({ status: 'created', socioId });
                }
                const values = actividades.map(actId => [socioId, actId]);
                const actividadQuery = `
                    INSERT INTO socio_actividad (socio_id, actividad_id)
                    VALUES ?`;

                mysqlConnection.query(
                    actividadQuery,
                    [values],
                    (err2) => {
                        if (err2) {
                            return res.status(500).json(err2);
                        }
                        res.json({ status: 'created', socioId });
                    }
                );
            }
        );

    } catch (error) {
        res.status(500).json(error);
    }
};

membershipController.updateMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      dni,
      cuota_activa,
      cuota_pasiva,
      futbol,
      paleta,
      basquet
    } = req.body;

    const socioQuery = `
      UPDATE socio 
      SET nombre = ?, dni = ?, cuota_activa = ?, cuota_pasiva = ?
      WHERE id = ?
    `;

    mysqlConnection.query(
      socioQuery,
      [nombre, dni || null, !!cuota_activa, !!cuota_pasiva, id],
      (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        // Borramos todas las actividades actuales del socio
        const deleteQuery = `DELETE FROM socio_actividad WHERE socio_id = ?`;
        mysqlConnection.query(deleteQuery, [id], (err2) => {
          if (err2) {
            return res.status(500).json(err2);
          }

          // Reinsertamos las actividades según lo recibido
          const actividades = [];
          if (futbol) actividades.push(1);
          if (paleta) actividades.push(2);
          if (basquet) actividades.push(3);

          if (actividades.length === 0) {
            return res.json({ status: 'updated', socioId: id });
          }

          const values = actividades.map(actId => [id, actId]);
          const insertQuery = `
            INSERT INTO socio_actividad (socio_id, actividad_id)
            VALUES ?
          `;

          mysqlConnection.query(insertQuery, [values], (err3) => {
            if (err3) {
              return res.status(500).json(err3);
            }
            res.json({ status: 'updated', socioId: id });
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = membershipController;