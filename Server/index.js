const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
var compression = require('compression');
var helmet = require('helmet');

require('./database');

// Settings

app.set('port', process.env.PORT || 3000);

// Middlewares

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({}))

// Routes

app.use(compression());
app.use(require('./routes/daily-box.routes'));
app.use(require('./routes/employees.routes'));
app.use(require('./routes/membership.routes'));
app.use(require('./routes/payments.routes'));
app.use(require('./routes/user.routes'));

// Starting the server

app.listen(app.get('port'), () => {
    console.log('Server on port ', app.get('port'));
})