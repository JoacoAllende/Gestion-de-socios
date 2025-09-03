const paymentsController = {};
const mysqlConnection = require('../database');

paymentsController.updatePayments = (req, res) => {
  try {
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
           WHERE socio_id = ? AND anio = 2025 AND mes = ?`,
          [pagado, efectivo, fechaPago, socioId, mesNum],
          (err) => {
            if (err && !errorOccurred) {
              errorOccurred = true;
              return res.status(500).json(err);
            }

            pending--;
            if (pending === 0 && !errorOccurred) {
              res.json({ status: 'updated' });
            }
          }
        );
      });
    });

    if (pending === 0 && !errorOccurred) {
      res.json({ status: 'updated' });
    }

  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = paymentsController;
