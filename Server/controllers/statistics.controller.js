const statisticsController = {};
const mysqlConnection = require('../database');

statisticsController.getIncomeByMembershipCard = (req, res) => {
  try {
    const { mes, anio } = req.params;

    if (!mes || !anio) {
      return res.status(400).json({ 
        message: 'Se requieren los parámetros mes y anio' 
      });
    }

    const sql = `
      SELECT 
        fs.id AS ficha_socio_id,
        fs.nombre AS ficha_socio,
        COUNT(DISTINCT p.socio_id) AS cantidad_socios,
        SUM(CASE WHEN p.efectivo = 1 THEN p.monto ELSE 0 END) AS total_efectivo,
        SUM(CASE WHEN p.efectivo = 0 THEN p.monto ELSE 0 END) AS total_transferencia,
        SUM(p.monto) AS total_ingresado_bruto,
        COUNT(p.id) AS cantidad_pagos
      FROM pago p
      INNER JOIN socio s ON p.socio_id = s.nro_socio
      INNER JOIN ficha_socio fs ON s.ficha_socio_id = fs.id
      WHERE MONTH(p.fecha_pago) = ? AND YEAR(p.fecha_pago) = ?
        AND p.pagado = TRUE
      GROUP BY fs.id, fs.nombre
      ORDER BY total_ingresado_bruto DESC
    `;

    mysqlConnection.query(sql, [mes, anio], (err, results) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error al obtener estadísticas de ingresos',
          error: err 
        });
      }

      const mesNum = parseInt(mes);
      const porcentaje = (mesNum === 1 || mesNum === 2) ? 0.20 : 0.16;

      const detalle = results.map(row => {
        const isAlejandra = row.ficha_socio_id === 1;
        
        let totalEfectivo = parseFloat(row.total_efectivo || 0);
        let totalTransferencia = parseFloat(row.total_transferencia || 0);
        let salidaEfectivo = 0;
        let salidaTransferencia = 0;

        if (isAlejandra) {
          salidaEfectivo = totalEfectivo * porcentaje;
          salidaTransferencia = totalTransferencia * porcentaje;
          totalEfectivo = totalEfectivo - salidaEfectivo;
          totalTransferencia = totalTransferencia - salidaTransferencia;
        }

        return {
          ficha_socio: row.ficha_socio,
          cantidad_socios: parseInt(row.cantidad_socios || 0),
          total_efectivo: parseFloat(totalEfectivo.toFixed(2)),
          total_transferencia: parseFloat(totalTransferencia.toFixed(2)),
          total_ingresado: parseFloat((totalEfectivo + totalTransferencia).toFixed(2)),
          salida_efectivo: parseFloat(salidaEfectivo.toFixed(2)),
          salida_transferencia: parseFloat(salidaTransferencia.toFixed(2)),
          cantidad_pagos: parseInt(row.cantidad_pagos || 0)
        };
      });

      const totalGeneral = detalle.reduce((sum, row) => sum + row.total_ingresado, 0);
      const totalEfectivoGeneral = detalle.reduce((sum, row) => sum + row.total_efectivo, 0);
      const totalTransferenciaGeneral = detalle.reduce((sum, row) => sum + row.total_transferencia, 0);
      const totalSocios = detalle.reduce((sum, row) => sum + row.cantidad_socios, 0);
      const totalSalidaEfectivo = detalle.reduce((sum, row) => sum + row.salida_efectivo, 0);
      const totalSalidaTransferencia = detalle.reduce((sum, row) => sum + row.salida_transferencia, 0);

      res.json({
        mes: mesNum,
        anio: parseInt(anio),
        porcentaje_aplicado: porcentaje * 100,
        total_general: parseFloat(totalGeneral.toFixed(2)),
        total_efectivo: parseFloat(totalEfectivoGeneral.toFixed(2)),
        total_transferencia: parseFloat(totalTransferenciaGeneral.toFixed(2)),
        total_salida_efectivo: parseFloat(totalSalidaEfectivo.toFixed(2)),
        total_salida_transferencia: parseFloat(totalSalidaTransferencia.toFixed(2)),
        total_socios: totalSocios,
        detalle: detalle
      });
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error 
    });
  }
};

module.exports = statisticsController;