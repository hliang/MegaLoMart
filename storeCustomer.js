require("dotenv").config();

var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: process.env.mysqlhost,
    user: process.env.mysqluser,
    password: process.env.mysqlpasswd,
    database: process.env.mysqldbname
});


connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    showProducts();
    // connection.end();
});


// list all products
function showProducts() {
    connection.query("select * from products", function (err, res) {
        if (err) throw err;
        console.log("=".repeat(13) + " Mega Lo Mart " + "=".repeat(13));
        console.log("ID".padStart(5, " ") + " | " + "Product Name".padStart(20, " ") + " | " + "Price".padStart(8, " "));
        console.log("-".repeat(40));
        res.forEach(row => {
            console.log(row.item_id.toString().padStart(5, " ") + " | " + row.product_name.padStart(20, " ") + " | " + row.price.toFixed(2).toString().padStart(8, " "));
        });
        console.log("-".repeat(40));
        getOrder();
    })
}


// update quantity in database when item is purched
function itemOut(item_id, quantity) {
    connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?;", [quantity, item_id], function (err, res) {
        if (err) throw err;
        // console.log("database updated");
    })
    // connection.end();
}

// ask what customer wants to buy
function getOrder() {
    // questions
    var questions = [
        {
            type: 'input',
            name: 'item_id',
            message: 'Enter product ID you want to buy:'
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'How many do you need?',
            validate: function (value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        }
    ];
    // ask questions
    // console.log("=".repeat(10) + " Mega Lo Mart " + "=".repeat(10));
    inquirer.prompt(questions).then(answers => {
        console.log("=".repeat(50));
        connection.query("select * from products where item_id = ? limit 1", [answers.item_id], function (err, res) {
            if (err) throw err;
            if (res.length == 0) {
                console.log("ops, couldn't find product id (" + answers.item_id + ")");
                connection.end();
            } else if (res[0].stock_quantity >= answers.quantity) {
                console.log("Order received for product ID:" + answers.item_id);
                console.log("Item Name: " + res[0].product_name);
                console.log("Quantity: " + answers.quantity);
                itemOut(answers.item_id, answers.quantity);
                let totalPrice = res[0].price * answers.quantity
                console.log("You need to pay: $" + totalPrice.toFixed(2));
                connection.end();
            } else {
                console.log("Insufficient quantity! Come back later.");
                connection.end();
            }
        });
    });
}