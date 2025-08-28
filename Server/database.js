const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'allende247855',
    database: 'gestion_socios'
});

mysqlConnection.connect(function(err){
    if (err){
        console.log(err);
        return;
    } else {
        console.log('db is connected');
    }
}); 

module.exports = mysqlConnection;