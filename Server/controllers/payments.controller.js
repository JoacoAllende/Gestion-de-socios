const paymentsController = {};
const mysqlConnection = require('../database');

paymentsController.updatePayments = (req, res) => {
  try {
    const { anio } = req.params;
    const { pagos = [] } = req.body;

    const mesesMap = {
      enero: 1, febrero: 2, marzo: 3, abril: 4,
      mayo: 5, junio: 6, julio: 7, agosto: 8,
      septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
    };

    let pending = 0;
    let errorOccurred = false;

    pagos.forEach(({ socioId, meses }) => {
      Object.entries(meses).forEach(([mesName, valor]) => {
        const mesNum = mesesMap[mesName];
        if (!mesNum) return;

        const pagado = true;
        const efectivo = valor === true;
        const fechaPago = new Date();

        pending++;

        mysqlConnection.query(
          `UPDATE pago
           SET pagado = ?, efectivo = ?, fecha_pago = ?
           WHERE socio_id = ? AND anio = ? AND mes = ?`,
          [pagado, efectivo, fechaPago, socioId, anio, mesNum],
          (err) => {
            if (err && !errorOccurred) {
              errorOccurred = true;
              return res.status(500).json(err);
            }

            pending--;
            if (pending === 0 && !errorOccurred) {
              res.json({ status: 'Pagos actualizados' });
            }
          }
        );
      });
    });

    if (pending === 0 && !errorOccurred) {
      res.json({ status: 'Pagos actualizados' });
    }

  } catch (error) {
    res.status(500).json(error);
  }
};

paymentsController.initializeYear = (req, res) => {
  try {
    const { anio } = req.params;

    mysqlConnection.query(
      'SELECT COUNT(*) as count FROM pago WHERE anio = ?',
      [anio],
      (errCheck, checkRows) => {
        if (errCheck) return res.status(500).json(errCheck);

        if (checkRows[0].count > 0) {
          return res.status(400).json({ 
            error: `Ya existen ${checkRows[0].count} pagos registrados para el año ${anio}. No se puede inicializar.` 
          });
        }

        mysqlConnection.query(
          'SELECT nro_socio FROM socio WHERE activo = TRUE',
          (errSocios, sociosRows) => {
            if (errSocios) return res.status(500).json(errSocios);

            if (sociosRows.length === 0) {
              return res.status(400).json({ error: 'No hay socios activos para inicializar' });
            }

            mysqlConnection.query(
              'SELECT valor FROM valor_socio_base LIMIT 1',
              (errBase, baseRows) => {
                if (errBase) return res.status(500).json(errBase);

                const valorBase = baseRows[0]?.valor || 0;

                mysqlConnection.query(
                  'SELECT cantidad_actividades, valor FROM valor_actividad',
                  (errActividad, actividadRows) => {
                    if (errActividad) return res.status(500).json(errActividad);

                    const valoresActividad = {};
                    actividadRows.forEach(row => {
                      valoresActividad[row.cantidad_actividades] = row.valor;
                    });

                    mysqlConnection.query(
                      `SELECT tipo, valor FROM configuracion_descuentos WHERE tipo IN ('FAMILIAR','PASIVA')`,
                      (errDesc, descuentoRows) => {
                        if (errDesc) return res.status(500).json(errDesc);

                        const df = descuentoRows.find(d => d.tipo === 'FAMILIAR')?.valor || 0;
                        const dp = descuentoRows.find(d => d.tipo === 'PASIVA')?.valor || 0;

                        const promises = sociosRows.map(socio => {
                          return new Promise((resolve, reject) => {
                            mysqlConnection.query(
                              `SELECT 
                                cuota_activa, cuota_pasiva, descuento_familiar, becado,
                                (SELECT COUNT(*) FROM socio_actividad WHERE socio_id = ?) as cant_actividades
                              FROM socio WHERE nro_socio = ?`,
                              [socio.nro_socio, socio.nro_socio],
                              (errInfo, infoRows) => {
                                if (errInfo) return reject(errInfo);

                                const info = infoRows[0];
                                const cantActividades = info.cant_actividades || 0;
                                const valorActividad = valoresActividad[cantActividades] || 0;

                                const montoBase = (info.cuota_activa || info.cuota_pasiva) ? valorBase : 0;
                                const descuentoFamiliar = info.descuento_familiar ? df : 0;
                                const descuentoPasiva = info.cuota_pasiva ? dp : 0;

                                const montoFinal = info.becado 
                                  ? -1 
                                  : montoBase + valorActividad - descuentoFamiliar - descuentoPasiva;

                                const pagoValues = [];
                                for (let mes = 1; mes <= 12; mes++) {
                                  pagoValues.push([
                                    socio.nro_socio,
                                    mes,
                                    anio,
                                    montoFinal,
                                    info.becado ? true : false
                                  ]);
                                }

                                mysqlConnection.query(
                                  'INSERT INTO pago (socio_id, mes, anio, monto, pagado) VALUES ?',
                                  [pagoValues],
                                  (errInsert) => {
                                    if (errInsert) return reject(errInsert);
                                    resolve();
                                  }
                                );
                              }
                            );
                          });
                        });

                        Promise.all(promises)
                          .then(() => {
                            res.json({ 
                              status: `Año ${anio} inicializado exitosamente`,
                              socios_procesados: sociosRows.length,
                              pagos_creados: sociosRows.length * 12
                            });
                          })
                          .catch(err => res.status(500).json(err));
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

paymentsController.recalculatePayments = (req, res) => {
  try {
    const { anio, mes_desde } = req.body;

    if (!anio || !mes_desde || mes_desde < 1 || mes_desde > 12) {
      return res.status(400).json({ error: 'Año y mes_desde (1-12) son obligatorios' });
    }

    mysqlConnection.query(
      'SELECT nro_socio FROM socio WHERE activo = TRUE',
      (errSocios, sociosRows) => {
        if (errSocios) return res.status(500).json(errSocios);

        if (sociosRows.length === 0) {
          return res.status(400).json({ error: 'No hay socios activos' });
        }

        mysqlConnection.query(
          'SELECT valor FROM valor_socio_base LIMIT 1',
          (errBase, baseRows) => {
            if (errBase) return res.status(500).json(errBase);

            const valorBase = baseRows[0]?.valor || 0;

            mysqlConnection.query(
              'SELECT cantidad_actividades, valor FROM valor_actividad',
              (errActividad, actividadRows) => {
                if (errActividad) return res.status(500).json(errActividad);

                const valoresActividad = {};
                actividadRows.forEach(row => {
                  valoresActividad[row.cantidad_actividades] = row.valor;
                });

                mysqlConnection.query(
                  `SELECT tipo, valor FROM configuracion_descuentos WHERE tipo IN ('FAMILIAR','PASIVA')`,
                  (errDesc, descuentoRows) => {
                    if (errDesc) return res.status(500).json(errDesc);

                    const df = descuentoRows.find(d => d.tipo === 'FAMILIAR')?.valor || 0;
                    const dp = descuentoRows.find(d => d.tipo === 'PASIVA')?.valor || 0;

                    let sociosActualizados = 0;
                    let pagosActualizados = 0;

                    const promises = sociosRows.map(socio => {
                      return new Promise((resolve, reject) => {
                        mysqlConnection.query(
                          `SELECT 
                            cuota_activa, cuota_pasiva, descuento_familiar, becado,
                            (SELECT COUNT(*) FROM socio_actividad WHERE socio_id = ?) as cant_actividades
                          FROM socio WHERE nro_socio = ?`,
                          [socio.nro_socio, socio.nro_socio],
                          (errInfo, infoRows) => {
                            if (errInfo) return reject(errInfo);

                            const info = infoRows[0];
                            const cantActividades = info.cant_actividades || 0;
                            const valorActividad = valoresActividad[cantActividades] || 0;

                            const montoBase = (info.cuota_activa || info.cuota_pasiva) ? valorBase : 0;
                            const descuentoFamiliar = info.descuento_familiar ? df : 0;
                            const descuentoPasiva = info.cuota_pasiva ? dp : 0;

                            const montoFinal = info.becado 
                              ? -1 
                              : montoBase + valorActividad - descuentoFamiliar - descuentoPasiva;

                            mysqlConnection.query(
                              `UPDATE pago 
                               SET monto = ?, pagado = ?
                               WHERE socio_id = ? AND anio = ? AND mes >= ? AND pagado = FALSE`,
                              [montoFinal, info.becado ? true : false, socio.nro_socio, anio, mes_desde],
                              (errUpdate, result) => {
                                if (errUpdate) return reject(errUpdate);
                                
                                if (result.affectedRows > 0) {
                                  sociosActualizados++;
                                  pagosActualizados += result.affectedRows;
                                }
                                resolve();
                              }
                            );
                          }
                        );
                      });
                    });

                    Promise.all(promises)
                      .then(() => {
                        res.json({ 
                          status: `Pagos recalculados desde ${mes_desde}/${anio}`,
                          socios_actualizados: sociosActualizados,
                          pagos_actualizados: pagosActualizados
                        });
                      })
                      .catch(err => res.status(500).json(err));
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = paymentsController;
