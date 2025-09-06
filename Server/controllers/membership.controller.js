const membershipController = {};

const mysqlConnection = require('../database');

membershipController.getMembership = async (req, res, next) => {
  const { nro_socio } = req.params;

  const socioQuery = `
    SELECT 
      nro_socio,
      nombre,
      dni,
      direccion,
      contacto,
      DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
      cuota_activa,
      cuota_pasiva,
      descuento_familiar,
      becado,
      ficha_socio_id,
      activo,
      categoria_futbol_id,
      categoria_basquet_id,
      categoria_paleta_id
    FROM socio
    WHERE nro_socio = ?
  `;
  const actividadesQuery = `
    SELECT a.nombre 
    FROM socio_actividad sa
    INNER JOIN actividad a ON sa.actividad_id = a.id
    WHERE sa.socio_id = ?
  `;

  mysqlConnection.query(socioQuery, [nro_socio], (err, socioRows) => {
    if (err) return res.status(500).json(err);

    if (socioRows.length === 0) {
      return res.status(404).json({ message: 'Socio no encontrado' });
    }

    const socio = socioRows[0];

    mysqlConnection.query(actividadesQuery, [nro_socio], (err, actRows) => {
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

membershipController.getFutbolCategories = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM categoria_futbol';
    mysqlConnection.query(query, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error al obtener categorías de futbol' });
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

membershipController.getBasquetCategories = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM categoria_basquet';
    mysqlConnection.query(query, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error al obtener categorías de basquet' });
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

membershipController.getPaletaCategories = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM categoria_paleta';
    mysqlConnection.query(query, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error al obtener categorías de paleta' });
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

membershipController.getMembershipCard = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM ficha_socio';

    mysqlConnection.query(query, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener ficha de socio' });
      }
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

membershipController.getMemberships = async (req, res, next) => {
  const anio = 2025;
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const cases = meses.map((m, i) => `
    MAX(
      CASE 
        WHEN p.mes = ${i + 1} AND p.pagado = TRUE  THEN p.monto
        WHEN p.mes = ${i + 1} AND p.pagado = FALSE THEN 0
        ELSE NULL
      END
    ) AS ${m}
  `).join(',\n');

  const query = `
    SELECT 
        s.id,
        s.nro_socio,
        s.nombre,
        s.dni,
        s.direccion,
        s.fecha_nacimiento,
        s.activo,
        s.cuota_activa,
        s.cuota_pasiva,
        s.descuento_familiar,
        s.becado,
        s.secretaria,
        DATE_FORMAT(s.fecha_nacimiento, '%d/%m/%Y') AS fecha_nacimiento,
        s.contacto,
        cf.nombre AS categoria_futbol,
        cp.nombre AS categoria_paleta,
        cb.nombre AS categoria_basquet,
        s.ficha_socio_id,
        cf.nombre AS categoria_futbol,
        cb.nombre AS categoria_basquet,
        cp.nombre AS categoria_paleta,
        MAX(CASE WHEN a.nombre = 'Futbol'  THEN 1 ELSE 0 END) AS futbol,
        MAX(CASE WHEN a.nombre = 'Paleta'  THEN 1 ELSE 0 END) AS paleta,
        MAX(CASE WHEN a.nombre = 'Basquet' THEN 1 ELSE 0 END) AS basquet,
        MAX(CASE WHEN p.mes = 12 THEN p.monto ELSE 0 END) AS monto,
        ${cases}
    FROM socio s
    LEFT JOIN categoria_futbol cf ON s.categoria_futbol_id = cf.id
    LEFT JOIN categoria_basquet cb ON s.categoria_basquet_id = cb.id
    LEFT JOIN categoria_paleta cp ON s.categoria_paleta_id = cp.id
    LEFT JOIN socio_actividad sa ON sa.socio_id = s.nro_socio
    LEFT JOIN actividad a ON a.id = sa.actividad_id
    LEFT JOIN pago p ON p.socio_id = s.nro_socio AND p.anio = ?
    WHERE s.activo = TRUE
    GROUP BY 
      s.id, s.nro_socio, s.nombre, s.dni, s.direccion, s.fecha_nacimiento, s.activo,
      s.cuota_activa, s.cuota_pasiva, s.descuento_familiar, s.becado, s.secretaria,
      s.categoria_futbol_id, s.categoria_basquet_id, s.categoria_paleta_id, s.ficha_socio_id,
      cf.nombre, cb.nombre, cp.nombre
    ORDER BY s.nombre ASC
  `;

  mysqlConnection.query(query, [anio], (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      res.status(500).json(err);
    }
  });
};

membershipController.getDischargedMemberships = async (req, res, next) => {
  const query = `
    SELECT 
        s.id,
        s.nro_socio,
        s.nombre,
        s.dni,
        s.direccion,
        s.fecha_nacimiento,
        s.activo,
        s.cuota_activa,
        s.cuota_pasiva,
        s.descuento_familiar,
        s.becado,
        s.secretaria,
        s.ficha_socio_id,
        cf.nombre AS categoria_futbol,
        cb.nombre AS categoria_basquet,
        cp.nombre AS categoria_paleta
    FROM socio s
    LEFT JOIN categoria_futbol cf ON s.categoria_futbol_id = cf.id
    LEFT JOIN categoria_basquet cb ON s.categoria_basquet_id = cb.id
    LEFT JOIN categoria_paleta cp ON s.categoria_paleta_id = cp.id
    WHERE s.activo = FALSE
    ORDER BY s.nombre ASC
  `;

  mysqlConnection.query(query, (err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      res.status(500).json(err);
    }
  });
};

membershipController.createMembership = (req, res) => {
  try {
    const {
      nombre,
      dni,
      direccion,
      fecha_nacimiento,
      contacto,
      cuota_activa,
      cuota_pasiva,
      descuento_familiar,
      becado,
      futbol,
      paleta,
      basquet,
      mes_alta = 1,
      ficha_socio_id,
      categoria_futbol_id,
      categoria_basquet_id,
      categoria_paleta_id,
      nro_socio
    } = req.body;

    const getMaxNroSocio = `SELECT MAX(nro_socio) AS maxNro FROM socio`;
    mysqlConnection.query(getMaxNroSocio, (errMax, rows) => {
      if (errMax) return res.status(500).json(errMax);

      const finalNroSocio = nro_socio || ((rows[0].maxNro || 0) + 1);

      const socioQuery = `
        INSERT INTO socio 
        (nro_socio, nombre, dni, direccion, fecha_nacimiento, contacto, cuota_activa, cuota_pasiva, descuento_familiar, becado, ficha_socio_id, activo, categoria_futbol_id, categoria_basquet_id, categoria_paleta_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?)`;

      mysqlConnection.query(
        socioQuery,
        [
          finalNroSocio,
          nombre,
          dni || null,
          direccion,
          fecha_nacimiento,
          contacto,
          !!cuota_activa,
          !!cuota_pasiva,
          !!descuento_familiar,
          !!becado,
          Number(ficha_socio_id),
          categoria_futbol_id ? Number(categoria_futbol_id) : null,
          categoria_basquet_id ? Number(categoria_basquet_id) : null,
          categoria_paleta_id ? Number(categoria_paleta_id) : null
        ],
        (err) => {
          if (err) return res.status(500).json(err);

          const actividades = [];
          if (!!futbol) actividades.push(1);
          if (!!paleta) actividades.push(2);
          if (!!basquet) actividades.push(3);

          const insertarActividades = (callback) => {
            if (actividades.length === 0) return callback();

            const values = actividades.map(actId => [finalNroSocio, actId]);
            const actividadQuery = `
              INSERT INTO socio_actividad (socio_id, actividad_id)
              VALUES ?`;

            mysqlConnection.query(actividadQuery, [values], (err2) => {
              if (err2) return res.status(500).json(err2);
              callback();
            });
          };

          const insertarPagos = () => {
            if (mes_alta < 1 || mes_alta > 12) return res.json({ status: 'created', finalNroSocio });

            const cantidadActividades = actividades.length;

            mysqlConnection.query(
              'SELECT valor FROM valor_actividad WHERE cantidad_actividades = ?',
              [cantidadActividades],
              (err3, valorRows) => {
                if (err3) return res.status(500).json(err3);

                const valorActividad = valorRows[0]?.valor || 0;

                mysqlConnection.query(
                  `SELECT tipo, valor FROM configuracion_descuentos WHERE tipo IN ('FAMILIAR','PASIVA')`,
                  (err4, descuentoRows) => {
                    if (err4) return res.status(500).json(err4);

                    const df = descuentoRows.find(d => d.tipo === 'FAMILIAR')?.valor || 0;
                    const dp = descuentoRows.find(d => d.tipo === 'PASIVA')?.valor || 0;

                    const pagoValues = [];
                    for (let mes = mes_alta; mes <= 12; mes++) {
                      const montoBase = 8500;
                      const descuentoFamiliarAplicado = !!descuento_familiar ? df : 0;
                      const descuentoPasivaAplicado = !!cuota_pasiva ? dp : 0;

                      const montoFinal = !!becado ? -1 : montoBase + valorActividad - descuentoFamiliarAplicado - descuentoPasivaAplicado;
                      pagoValues.push([finalNroSocio, mes, 2025, montoFinal, !!becado ? true : false]);
                    }

                    if (pagoValues.length === 0) return res.json({ status: 'created', finalNroSocio });

                    const pagoQuery = `
                      INSERT INTO pago (socio_id, mes, anio, monto, pagado)
                      VALUES ?`;

                    mysqlConnection.query(pagoQuery, [pagoValues], (err5) => {
                      if (err5) return res.status(500).json(err5);
                      res.json({ status: 'created', finalNroSocio });
                    });
                  }
                );
              }
            );
          };

          insertarActividades(insertarPagos);
        }
      );
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

membershipController.updateMembership = (req, res) => {
  try {
    const nroSocio = req.params.nro_socio;
    const {
      nombre,
      dni,
      direccion,
      fecha_nacimiento,
      contacto,
      cuota_activa,
      cuota_pasiva,
      descuento_familiar,
      becado,
      futbol,
      paleta,
      basquet,
      mes_alta = 1,
      ficha_socio_id,
      categoria_futbol_id,
      categoria_basquet_id,
      categoria_paleta_id
    } = req.body;

    const updateSocioQuery = `
      UPDATE socio
      SET nombre = ?, dni = ?, direccion = ?, fecha_nacimiento = ?, contacto = ?, cuota_activa = ?, cuota_pasiva = ?, descuento_familiar = ?, becado = ?, 
          ficha_socio_id = ?, categoria_futbol_id = ?, categoria_basquet_id = ?, categoria_paleta_id = ?
      WHERE nro_socio = ?`;

    mysqlConnection.query(
      updateSocioQuery,
      [
        nombre,
        dni || null,
        direccion,
        fecha_nacimiento,
        contacto,
        !!cuota_activa,
        !!cuota_pasiva,
        !!descuento_familiar,
        !!becado,
        ficha_socio_id,
        categoria_futbol_id || null,
        categoria_basquet_id || null,
        categoria_paleta_id || null,
        nroSocio
      ],
      (err) => {
        if (err) return res.status(500).json(err);

        const actividades = [];
        if (futbol) actividades.push(1);
        if (paleta) actividades.push(2);
        if (basquet) actividades.push(3);

        mysqlConnection.query(`DELETE FROM socio_actividad WHERE socio_id = ?`, [nroSocio], (err2) => {
          if (err2) return res.status(500).json(err2);

          if (actividades.length > 0) {
            const values = actividades.map(actId => [nroSocio, actId]);
            mysqlConnection.query(`INSERT INTO socio_actividad (socio_id, actividad_id) VALUES ?`, [values], (err3) => {
              if (err3) return res.status(500).json(err3);
              actualizarPagos();
            });
          } else {
            actualizarPagos();
          }
        });

        const actualizarPagos = () => {
          if (mes_alta < 1 || mes_alta > 12) return res.json({ status: 'updated', nroSocio });

          mysqlConnection.query(
            'SELECT valor FROM valor_actividad WHERE cantidad_actividades = ?',
            [actividades.length],
            (err4, valorRows) => {
              if (err4) return res.status(500).json(err4);

              const valorActividad = valorRows[0]?.valor || 0;

              mysqlConnection.query(
                `SELECT tipo, valor FROM configuracion_descuentos WHERE tipo IN ('FAMILIAR','PASIVA')`,
                (err5, descuentoRows) => {
                  if (err5) return res.status(500).json(err5);

                  const df = descuentoRows.find(d => d.tipo === 'FAMILIAR')?.valor || 0;
                  const dp = descuentoRows.find(d => d.tipo === 'PASIVA')?.valor || 0;

                  const montoBase = 8500;
                  const montoFinal = becado
                    ? -1
                    : montoBase + valorActividad - (descuento_familiar ? df : 0) - (cuota_pasiva ? dp : 0);

                  mysqlConnection.query(
                    `UPDATE pago
                     SET monto = ?, pagado = ?
                     WHERE socio_id = ? AND mes >= ? AND anio = 2025 AND pagado = false`,
                    [montoFinal, becado ? true : false, nroSocio, mes_alta],
                    (err6) => {
                      if (err6) return res.status(500).json(err6);
                      res.json({ status: 'updated', nroSocio });
                    }
                  );
                }
              );
            }
          );
        };
      }
    );

  } catch (error) {
    res.status(500).json(error);
  }
};


module.exports = membershipController;