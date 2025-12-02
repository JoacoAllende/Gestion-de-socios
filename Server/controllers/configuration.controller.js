const configurationController = {};
const mysqlConnection = require('../database');

configurationController.getActivityValues = (req, res) => {
  try {
    const sql = 'SELECT * FROM valor_actividad ORDER BY cantidad_actividades ASC';
    
    mysqlConnection.query(sql, (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

configurationController.updateActivityValue = (req, res) => {
  try {
    const { id } = req.params;
    const { valor } = req.body;

    const sql = 'UPDATE valor_actividad SET valor = ? WHERE id = ?';
    
    mysqlConnection.query(sql, [valor, id], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ status: 'Valor de actividad actualizado' });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

configurationController.getDiscounts = (req, res) => {
  try {
    const sql = 'SELECT * FROM configuracion_descuentos';
    
    mysqlConnection.query(sql, (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

configurationController.updateDiscount = (req, res) => {
  try {
    const { tipo } = req.params;
    const { valor } = req.body;

    const sql = 'UPDATE configuracion_descuentos SET valor = ? WHERE tipo = ?';
    
    mysqlConnection.query(sql, [valor, tipo], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ status: 'Descuento actualizado' });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

configurationController.getBaseMemberValue = (req, res) => {
  try {
    const sql = 'SELECT * FROM valor_socio_base LIMIT 1';
    
    mysqlConnection.query(sql, (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0) return res.status(404).json({ message: 'Valor socio base no encontrado' });
      res.json(rows[0]);
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

configurationController.updateBaseMemberValue = (req, res) => {
  try {
    const { valor } = req.body;

    const sql = 'UPDATE valor_socio_base SET valor = ? WHERE id = 1';
    
    mysqlConnection.query(sql, [valor], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ status: 'Valor socio base actualizado' });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = configurationController;