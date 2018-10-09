
const inquirer = require('inquirer');
const cTable = require('console.table');

// file containing the mysql connection
const connection = require("./connection.js");

require('./customerView.js')(inquirer, connection, cTable);
require('./managerView.js')(inquirer, connection, cTable);
require('./supervisorView.js')(inquirer, connection, cTable);  


openShop = () => {
    connection.query('SELECT * from products', function (err, res) {
        if (err) throw err;
        bamazonOptions(res);
    });
}

bamazonOptions = products => {
    console.log('Welcome to Bamazon!');
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'storeView',
                message: "What Bamazon view would you like to see?",
                choices: ['Customer', "Manager", "Supervisor", "Exit"]
            }
        ])
        .then(answers => {

            switch(answers.storeView) {
                case 'Customer':
                    console.log('Customer View...');
                    purchase(products);
                    break;
                case 'Manager':
                console.log('Manager View...');
                    managerView();
                    break;
                case 'Supervisor':
                    console.log('Supervisor View...');
                    supervisorView();
                    break;
                case 'Exit':
                    console.log('\nThanks for stopping by!\n');
                    connection.end();
            }
        });
}

openShop();

