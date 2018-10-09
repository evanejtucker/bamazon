
module.exports = function (inquirer, connection, cTable) {

    managerView = () => {

        let products;
        connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;
            products = res;
        });

        inquirer.prompt([
            {
                type: 'list',
                name: 'options',
                message: "What action would you like to perform?",
                choices: ["Check Inventory", "Check low inventory", "Add to inventory", "Add new product", "Delete a product", "Back to shop"]
            }
        ]).then(answers => {
            switch(answers.options) {
                case 'Check Inventory':
                    viewProducts(products);
                    break;
                case 'Check low inventory':
                    viewLowInventory();
                    break;
                case 'Add to inventory':
                    addInventory(products);
                    break;
                case 'Add new product':
                    addProduct()
                    break;
                case 'Delete a product':
                    deleteProduct(products)
                    break;
                case 'Back to shop':
                    openShop();
                    break;
            }
        }); 
    }

    // display all products in a table
    viewProducts = (products) => {
        console.table(products);
        anotherAction();
    }

    // display products with an inventory less than 25
    viewLowInventory = () => {
        console.log('\nFinding products with an inventory less than 25...\n')
        connection.query("SELECT * FROM products WHERE (stock_quantity < 25)", function(err, res) {
            if (err) throw err;
            console.table(res);
            anotherAction();
        });
    }

    // allows user to add stock_quantity to a product
    addInventory = (products) => {
        console.table(products);
        productsArray = [];
        for (var i=0; i<products.length; i++) {
            productsArray.push(products[i].product_name);
        }
        inquirer.prompt([
            {
                type: 'list',
                name: 'product',
                message: "Which product would you like to add inventory to?",
                choices: productsArray
            },
            {
                type: 'input',
                name: 'quantity',
                message: 'How much inventory would you like to add?',
                validate: (input) => {
                    if (!isNaN(input) && input < 5000) {
                        return true
                    } else if (input > 5000) {
                        console.log(': we dont have room for that much inventory :(');
                        return false;
                    }
                    console.log(': must input valid a numer');
                    return false;
                }
            }
        ]).then(answers => {
            connection.query("UPDATE products SET stock_quantity=(stock_quantity+ ?) WHERE product_name = ?", [answers.quantity, answers.product], function(err, res) {
                if (err) throw err;
                console.log(`\nCongrats! \nYou just increased the stock of ${answers.product} by ${answers.quantity} units!\n`);
                anotherAction(products);
            });
        }); 
    }

    // allows user to add a product to the table
    addProduct = ()=> {

        departmentArray = [];

        connection.query("SELECT * FROM departments", function(err, res) {
            if (err) throw err;
            for(var i=0; i<res.length; i++) {
                departmentArray.push(res[i].department_name);     
            }
        });

        inquirer.prompt([
            {
                type: 'input',
                name: 'productName',
                message: 'What new product would you like to add?'
            },
            {
                type: 'input',
                name: 'price',
                message: 'how much will this new product go for?',
                validate: (input)=> {
                    var price = /^\d+(?:[.,]\d+)*$/;
                    if(price.test(input)) {
                        return true 
                    }
                    console.log(': must be a valid price ($$.$$)');
                    return false;
                }
            },
            {
                type: 'list',
                name: 'department',
                message: 'What department will this new product be sold in?',
                choices: departmentArray
            }, 
            {
                type: 'input',
                name: 'inventory',
                message: 'how will the beginning inventory be?',
                validate: (input) => {
                    if (!isNaN(input) && input < 5000) {
                        return true
                    } else if (input > 5000) {
                        console.log(': We dont have room for that much in the store :(');
                        return false;
                    }
                    console.log(': must input valid a numer');
                    return false;
                }
            } 
        ]).then((answers)=> {
            let vals = [answers.productName, answers.department, answers.price, answers.inventory];
            connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)", vals, function(err, res) {
                if (err) throw err;
                console.log("\nNew product successfully added!\n");
                anotherAction();
            });
        });
    }

    // allows user to delete specific product from the table
    deleteProduct = (products)=> {
        console.table(products);

        let idArray = [];
        for (var i=0; i<products.length; i++) {
            idArray.push(products[i].item_id);
        }

        inquirer.prompt([
            {
                type: "input",
                name: "id",
                message: "Select the ID for the product you would like to delete.",
                validate: (input)=> {
                    if(!isNaN(input)  && idArray.includes(parseInt(input))) {
                        return true;
                    }
                    console.log(': Please select a valid ID');
                }
            },
            {
                type: "confirm",
                name: "confirm",
                message: "Are you sure you want to delete this product?",
            }
        ]).then((answers)=> {
            if (answers.confirm) {
                for (var i=0; i<products.length; i++) {
                    if (products[i].item_id === parseInt(answers.id)) {
                        connection.query("DELETE FROM products WHERE item_id = ?", [answers.id], function(err, res) {
                            if (err) throw err;
                            console.log('\nProduct successfully removed!\n');
                            anotherAction();
                        });
                    }
                }
            } else {
                anotherAction();
            }
        });
    }

    // redirects user back to manager options, or back to store page
    anotherAction = ()=> {
        inquirer.prompt([
            {
                type: 'confirm',
                name: 'anotherAction',
                message: "What you like to perform another action?"
            }
        ]).then(answers => {
            if (answers.anotherAction) {
                managerView()
            } else {
                console.log('\nthanks for coming by!\n');
                openShop();
            }
        });   
    }

}