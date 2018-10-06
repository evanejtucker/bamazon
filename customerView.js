
module.exports = function (inquirer, connection, cTable) {

    // prompts the user to select a product from the database, and choose a purchase quantity
    purchase = (products) => {

        customerTable(products);

        const productArray = [];
        for (var i = 0; i < products.length; i++) {
            productArray.push(products[i].product_name);
        };

        inquirer.prompt([
            {
                type: 'list',
                name: 'productName',
                message: "What item would you like to purchase",
                choices: productArray
            },
            {
                type: 'input',
                name: 'quantity',
                message: 'How many would you like to purchase?',
                validate: (input) => {
                    if (!isNaN(input)) {
                        return true
                    }
                    console.log(': must input valid a numer');
                    return false;
                }
            }
        ]).then(answers => {
            inStock(products, answers);
        });     
    }

    // checks to see if there is enough stock_quantity to make the purchase
    inStock = (products, answers) => {
        for (var i = 0; i < products.length; i++) {
            if (products[i].product_name === answers.productName) {
                if (answers.quantity < products[i].stock_quantity) {
                    console.log('Great choice\nlooks like we have enough in stock!\n')
                    return makePurchase(products[i], answers.quantity)
                }
                console.log("looks like we don't have quite enouth in stock\n");
                // return purchase(products)
                return anotherPurchase();
            }
        }
    }

    // function to update the database after a purchase
    makePurchase = (product, quantity) => {

        const newQuantity = product.stock_quantity - quantity;
        const productName = product.product_name;
        const salesPrice = parseFloat(product.price * quantity).toFixed(2);

        connection.query("UPDATE products SET stock_quantity = ?, product_sales = (product_sales + ?) WHERE product_name = ?", [newQuantity, salesPrice, productName], function (err, res) {
            if (err) throw err;
            console.log(`Congratulations!! \nYou are now the proud owner of ${quantity} new ${productName}'s for the low low price of ${salesPrice} dollars!\n`);
            anotherPurchase();
        });
    }

    // give the user the rerun teh purchase function, or end the connection
    anotherPurchase = () => {
        inquirer.prompt([
            {
                type: 'confirm',
                name: 'newPurchase',
                message: "Would you like to keep shopping?",
            }
        ]).then(answers => {
            if (answers.newPurchase) {
                connection.query('SELECT * from products', function (err, res) {
                    if (err) throw err;
                    purchase(res);
                });
            } else {
                console.log('Thanks for shopping! \nCome back again soon!');
                connection.end()
            }
        });   
    }

    // function to filter the products array adn display a table
    customerTable = (products)=> {
        const filteredProducts = [];

        for (var i = 0; i < products.length; i++) {
            let newObj = {
                id: products[i].item_id,
                name: products[i].product_name,
                department: products[i].department_name,
                price: products[i].price,
                stock: products[i].stock_quantity,
            }
            filteredProducts.push(newObj);
        };

        console.table(filteredProducts);
    }

};