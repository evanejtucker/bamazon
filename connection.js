
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost', //replace with your connection name
    user: 'root', // replace with your user
    password: 'root', // replace with your passport
    database: 'bamazon' // replace with your database name
});

connection.connect(function (err) {
    if (err) {
        console.log('Something went wrong with the connection :(')
        throw err
    };
    console.log("connected as id " + connection.threadId);
});


module.exports = connection;