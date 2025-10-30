const statisticsController = {};
const mysqlConnection = require('../database');

statisticsController.getIncomeByMembershipCard = (req, res) => {
  try {
    const { mes, anio } = req.params;

    if (!mes || !anio) {
      return res.status(400).json({
        message: 'Se requieren los parámetros mes y año'
      });
    }

    const mesNum = parseInt(mes);
    const anioNum = parseInt(anio);

    const mesAnterior = mesNum === 1 ? 12 : mesNum - 1;
    const anioAnterior = mesNum === 1 ? anioNum - 1 : anioNum;

    const sql = `
      SELECT 
        fs.id AS ficha_socio_id,
        fs.nombre AS ficha_socio,
        COUNT(DISTINCT p.socio_id) AS cantidad_socios,
        SUM(CASE WHEN p.efectivo = 1 THEN p.monto ELSE 0 END) AS total_efectivo,
        SUM(CASE WHEN p.efectivo = 0 THEN p.monto ELSE 0 END) AS total_transferencia,
        SUM(p.monto) AS total_ingresado_bruto,
        COUNT(p.id) AS cantidad_pagos,

        SUM(CASE WHEN p.mes = ? AND p.anio = ? THEN p.monto ELSE 0 END) AS total_correspondiente_mes,
        SUM(CASE WHEN p.mes = ? AND p.anio = ? THEN p.monto ELSE 0 END) AS total_correspondiente_mes_anterior,
        SUM(CASE WHEN NOT ( (p.mes = ? AND p.anio = ?) OR (p.mes = ? AND p.anio = ?) ) THEN p.monto ELSE 0 END) AS total_correspondiente_otros
      FROM pago p
      INNER JOIN socio s ON p.socio_id = s.nro_socio
      INNER JOIN ficha_socio fs ON s.ficha_socio_id = fs.id
      WHERE MONTH(p.fecha_pago) = ? 
        AND YEAR(p.fecha_pago) = ?
        AND p.pagado = TRUE
      GROUP BY fs.id, fs.nombre
      ORDER BY total_ingresado_bruto DESC
    `;

    const params = [
      mesNum, anioNum,
      mesAnterior, anioAnterior,
      mesNum, anioNum,
      mesAnterior, anioAnterior,
      mesNum, anioNum
    ];

    mysqlConnection.query(sql, params, (err, pagosDelMes) => {
      if (err) {
        return res.status(500).json({
          message: 'Error al obtener estadísticas de ingresos (pagos del mes)',
          error: err
        });
      }

      // Segunda consulta: pagos correspondientes al mes (sin importar cuándo se pagaron)
      const sql2 = `
        SELECT 
          fs.id AS ficha_socio_id,
          fs.nombre AS ficha_socio,
          SUM(p.monto) AS total_correspondiente,
          COUNT(p.id) AS cantidad_pagos_correspondientes
        FROM pago p
        INNER JOIN socio s ON p.socio_id = s.nro_socio
        INNER JOIN ficha_socio fs ON s.ficha_socio_id = fs.id
        WHERE p.mes = ? 
          AND p.anio = ?
          AND p.pagado = TRUE
        GROUP BY fs.id, fs.nombre
      `;

      mysqlConnection.query(sql2, [mesNum, anioNum], (err2, pagosCorrespondientes) => {
        if (err2) {
          return res.status(500).json({
            message: 'Error al obtener pagos correspondientes al mes',
            error: err2
          });
        }

        const porcentaje = (mesNum === 1 || mesNum === 2) ? 0.20 : 0.16;

        const mapaCorrespondientes = Object.fromEntries(
          pagosCorrespondientes.map(p => [p.ficha_socio_id, p])
        );

        const detalle = pagosDelMes.map(row => {
          const isAlejandra = row.ficha_socio_id === 1;

          let totalEfectivo = parseFloat(row.total_efectivo || 0);
          let totalTransferencia = parseFloat(row.total_transferencia || 0);
          let salidaEfectivo = 0;
          let salidaTransferencia = 0;

          if (isAlejandra) {
            salidaEfectivo = totalEfectivo * porcentaje;
            salidaTransferencia = totalTransferencia * porcentaje;
            totalEfectivo -= salidaEfectivo;
            totalTransferencia -= salidaTransferencia;
          }

          const pagoCorrespondiente = mapaCorrespondientes[row.ficha_socio_id];
          const totalCorrespondiente = pagoCorrespondiente
            ? parseFloat(pagoCorrespondiente.total_correspondiente || 0)
            : 0;

          return {
            ficha_socio: row.ficha_socio,
            cantidad_socios: parseInt(row.cantidad_socios || 0),
            total_efectivo: parseFloat(totalEfectivo.toFixed(2)),
            total_transferencia: parseFloat(totalTransferencia.toFixed(2)),
            total_ingresado: parseFloat((totalEfectivo + totalTransferencia).toFixed(2)),
            salida_efectivo: parseFloat(salidaEfectivo.toFixed(2)),
            salida_transferencia: parseFloat(salidaTransferencia.toFixed(2)),
            cantidad_pagos: parseInt(row.cantidad_pagos || 0),

            total_correspondiente_mes: parseFloat(row.total_correspondiente_mes || 0),
            total_correspondiente_mes_anterior: parseFloat(row.total_correspondiente_mes_anterior || 0),
            total_correspondiente_otros: parseFloat(row.total_correspondiente_otros || 0),

            total_correspondiente_sin_importar_fecha: parseFloat(totalCorrespondiente.toFixed(2))
          };
        });

        const sum = (key) => detalle.reduce((a, b) => a + (b[key] || 0), 0);

        const sqlSociosPagaronMes = `
          SELECT COUNT(DISTINCT socio_id) AS total_socios_pagaron_mes
          FROM pago
          WHERE anio = ? AND mes = ? AND pagado = TRUE
        `;

        mysqlConnection.query(sqlSociosPagaronMes, [anioNum, mesNum], (err3, resultMes) => {
          if (err3) {
            return res.status(500).json({
              message: 'Error al obtener socios que pagaron el mes actual',
              error: err3
            });
          }

          const total_socios_pagaron_mes = resultMes[0]?.total_socios_pagaron_mes || 0;

          const sqlSociosNoPagaronMesPeroAnterior = `
            SELECT COUNT(DISTINCT p_anterior.socio_id) AS total_socios_no_pagaron_mes_pero_pagaron_anterior
            FROM pago p_anterior
            WHERE p_anterior.anio = ? AND p_anterior.mes = ? AND p_anterior.pagado = TRUE
              AND p_anterior.socio_id NOT IN (
                SELECT socio_id FROM pago 
                WHERE anio = ? AND mes = ? AND pagado = TRUE
              )
          `;

          mysqlConnection.query(
            sqlSociosNoPagaronMesPeroAnterior,
            [anioAnterior, mesAnterior, anioNum, mesNum],
            (err4, resultNoPagaron) => {
              if (err4) {
                return res.status(500).json({
                  message: 'Error al obtener socios que no pagaron este mes pero sí el anterior',
                  error: err4
                });
              }

              const total_socios_no_pagaron_mes_pero_pagaron_anterior =
                resultNoPagaron[0]?.total_socios_no_pagaron_mes_pero_pagaron_anterior || 0;

              res.json({
                mes: mesNum,
                anio: anioNum,
                porcentaje_aplicado: porcentaje * 100,

                total_general: parseFloat(sum('total_ingresado').toFixed(2)),
                total_efectivo: parseFloat(sum('total_efectivo').toFixed(2)),
                total_transferencia: parseFloat(sum('total_transferencia').toFixed(2)),

                total_correspondiente_mes: parseFloat(sum('total_correspondiente_mes').toFixed(2)),
                total_correspondiente_mes_anterior: parseFloat(sum('total_correspondiente_mes_anterior').toFixed(2)),
                total_correspondiente_otros: parseFloat(sum('total_correspondiente_otros').toFixed(2)),
                total_correspondiente_sin_importar_fecha: parseFloat(sum('total_correspondiente_sin_importar_fecha').toFixed(2)),

                total_salida_efectivo: parseFloat(sum('salida_efectivo').toFixed(2)),
                total_salida_transferencia: parseFloat(sum('salida_transferencia').toFixed(2)),

                total_socios: parseInt(sum('cantidad_socios')),
                total_socios_pagaron_mes,
                total_socios_no_pagaron_mes_pero_pagaron_anterior,

                detalle
              });
            }
          );
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error interno del servidor',
      error
    });
  }
};

module.exports = statisticsController;