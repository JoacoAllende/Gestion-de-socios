const sponsorController = {};
const mysqlConnection = require('../database');

const tiposMap = {
  'camisetas': 'CAMISETA',
  'colectivo': 'COLECTIVO'
};

const mesesMap = {
  'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
  'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
  'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
};

const getTipo = (req, res) => {
  const tipo = tiposMap[req.params.tipo];
  if (!tipo) res.status(400).json({ error: 'Tipo de publicidad inválido' });
  return tipo;
};

sponsorController.getSponsors = (req, res) => {
  try {
    const { anio } = req.params;
    const tipo = getTipo(req, res);
    if (!tipo) return;

    const cases = Object.keys(mesesMap).map((m, i) => `
      MAX(
        CASE
          WHEN p.mes = ${i + 1} AND p.cobrado = TRUE THEN p.monto_mes
          WHEN p.mes = ${i + 1} AND p.cobrado = FALSE THEN 0
          ELSE NULL
        END
      ) AS ${m}
    `).join(',\n');

    const query = `
      SELECT
        a.id,
        a.nombre,
        CASE WHEN a.activo = FALSE THEN 0 ELSE a.monto_base END AS monto,
        a.activo,
        a.detalles,
        ${cases}
      FROM anunciante a
      INNER JOIN publicidad p ON p.anunciante_id = a.id AND p.anio = ?
      WHERE a.tipo = ?
      GROUP BY a.id, a.nombre, a.monto_base, a.activo
      ORDER BY a.activo DESC, a.nombre ASC
    `;

    mysqlConnection.query(query, [anio, tipo], (err, rows) => {
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

sponsorController.getSponsorById = (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        a.id,
        a.nombre,
        a.monto_base AS monto,
        a.detalles,
        a.activo
      FROM anunciante a
      WHERE a.id = ?
    `;

    mysqlConnection.query(query, [id], (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0) return res.status(404).json({ error: 'Publicidad no encontrada' });
      res.json(rows[0]);
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

sponsorController.createSponsor = (req, res) => {
  try {
    const { anio } = req.params;
    const tipo = getTipo(req, res);
    if (!tipo) return;
    const { nombre, monto, detalles } = req.body;
    const mes_alta = Number(req.body.mes_alta);

    if (!nombre || monto == null || !mes_alta) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const anuncianteQuery = `
      INSERT INTO anunciante (nombre, tipo, monto_base, detalles, activo)
      VALUES (?, ?, ?, ?, TRUE)
    `;

    mysqlConnection.query(
      anuncianteQuery,
      [nombre, tipo, monto, detalles || null],
      (err, result) => {
        if (err) return res.status(500).json(err);

        const anuncianteId = result.insertId;

        const publicidadValues = [];
        for (let mes = mes_alta; mes <= 12; mes++) {
          publicidadValues.push([anuncianteId, anio, mes, monto, false]);
        }

        if (publicidadValues.length === 0) {
          return res.json({ status: 'Publicidad creada', anuncianteId });
        }

        const publicidadQuery = `
          INSERT INTO publicidad (anunciante_id, anio, mes, monto_mes, cobrado)
          VALUES ?
        `;

        mysqlConnection.query(publicidadQuery, [publicidadValues], (err2) => {
          if (err2) return res.status(500).json(err2);
          res.json({ status: 'Publicidad creada', anuncianteId });
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

sponsorController.updateSponsor = (req, res) => {
  try {
    const { id, anio } = req.params;
    const { nombre, monto, detalles, baja, alta } = req.body;
    const mes_alta = Number(req.body.mes_alta);

    if (!id || !nombre || monto == null || !mes_alta) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const updateAnuncianteQuery = `
      UPDATE anunciante
      SET nombre = ?, monto_base = ?, detalles = ?
      WHERE id = ?
    `;

    mysqlConnection.query(
      updateAnuncianteQuery,
      [nombre, monto, detalles || null, id],
      (err) => {
        if (err) return res.status(500).json(err);

        if (baja) {
          const deletePublicidadesQuery = `
            DELETE FROM publicidad
            WHERE anunciante_id = ? AND anio = ? AND mes >= ? AND cobrado = FALSE
          `;
          mysqlConnection.query(deletePublicidadesQuery, [id, anio, mes_alta], (err2) => {
            if (err2) return res.status(500).json(err2);

            mysqlConnection.query('UPDATE anunciante SET activo = FALSE WHERE id = ?', [id], (err3) => {
              if (err3) return res.status(500).json(err3);
              return res.json({ status: 'Publicidad dada de baja', anuncianteId: id });
            });
          });
        } else if (alta) {
          const publicidadValues = [];
          for (let mes = mes_alta; mes <= 12; mes++) {
            publicidadValues.push([id, anio, mes, monto, false]);
          }

          const activate = () => {
            mysqlConnection.query('UPDATE anunciante SET activo = TRUE WHERE id = ?', [id], (err3) => {
              if (err3) return res.status(500).json(err3);
              return res.json({ status: 'Publicidad dada de alta', anuncianteId: id });
            });
          };

          if (publicidadValues.length > 0) {
            // Los meses que ya existen (cobrados antes de la baja) se mantienen
            const insertPublicidadesQuery = `
              INSERT INTO publicidad (anunciante_id, anio, mes, monto_mes, cobrado)
              VALUES ?
              ON DUPLICATE KEY UPDATE id = id
            `;
            mysqlConnection.query(insertPublicidadesQuery, [publicidadValues], (err2) => {
              if (err2) return res.status(500).json(err2);
              activate();
            });
          } else {
            activate();
          }
        } else {
          const updatePublicidadesQuery = `
            UPDATE publicidad
            SET monto_mes = ?
            WHERE anunciante_id = ? AND anio = ? AND mes >= ? AND cobrado = FALSE
          `;
          mysqlConnection.query(updatePublicidadesQuery, [monto, id, anio, mes_alta], (err4) => {
            if (err4) return res.status(500).json(err4);
            res.json({ status: 'Publicidad actualizada', anuncianteId: id });
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

sponsorController.updatePayments = (req, res) => {
  try {
    const { anio } = req.params;
    const { pagos } = req.body;

    if (!Array.isArray(pagos) || pagos.length === 0) {
      return res.status(400).json({ error: 'No se recibieron datos para actualizar' });
    }

    const queries = [];

    pagos.forEach(anunciante => {
      const { sponsorId, meses } = anunciante;
      if (!sponsorId || !meses) return;

      Object.entries(meses).forEach(([mesName, cobrado]) => {
        const mesNum = mesesMap[mesName.toLowerCase()];
        if (mesNum && typeof cobrado === 'boolean') {
          queries.push(new Promise((resolve, reject) => {
            const query = `
              UPDATE publicidad
              SET cobrado = ?
              WHERE anunciante_id = ? AND anio = ? AND mes = ?
            `;
            mysqlConnection.query(query, [cobrado, sponsorId, anio, mesNum], (err) => {
              if (err) reject(err);
              else resolve();
            });
          }));
        }
      });
    });

    Promise.all(queries)
      .then(() => res.json({ status: 'Publicidades actualizadas' }))
      .catch(err => res.status(500).json(err));
  } catch (error) {
    res.status(500).json(error);
  }
};

sponsorController.initializeYear = (req, res) => {
  try {
    const { anio } = req.params;

    mysqlConnection.query(
      'SELECT COUNT(*) as count FROM publicidad WHERE anio = ?',
      [anio],
      (errCheck, checkRows) => {
        if (errCheck) return res.status(500).json(errCheck);

        if (checkRows[0].count > 0) {
          return res.status(400).json({
            error: `Ya existen ${checkRows[0].count} publicidades registradas para el año ${anio}. No se puede inicializar.`
          });
        }

        mysqlConnection.query(
          'SELECT id, monto_base FROM anunciante WHERE activo = TRUE',
          (errAnunciantes, anunciantesRows) => {
            if (errAnunciantes) return res.status(500).json(errAnunciantes);

            if (anunciantesRows.length === 0) {
              return res.status(400).json({ error: 'No hay publicidades activas para inicializar' });
            }

            const publicidadValues = [];
            anunciantesRows.forEach(anunciante => {
              for (let mes = 1; mes <= 12; mes++) {
                publicidadValues.push([anunciante.id, anio, mes, anunciante.monto_base, false]);
              }
            });

            const insertQuery = `
              INSERT INTO publicidad (anunciante_id, anio, mes, monto_mes, cobrado)
              VALUES ?
            `;

            mysqlConnection.query(insertQuery, [publicidadValues], (errInsert) => {
              if (errInsert) return res.status(500).json(errInsert);

              res.json({
                status: `Año ${anio} inicializado exitosamente`,
                anunciantes_procesados: anunciantesRows.length,
                publicidades_creadas: publicidadValues.length
              });
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = sponsorController;
