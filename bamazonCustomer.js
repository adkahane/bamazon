var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
var clear = require("clear");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "iamR00t",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  customer();
});

function customer() {
  displayItems();
}

function displayItems() {
  console.log("Welcome to Bamazon, here is what we have for sale: \n");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // instantiate a new table and push items into it from database
    var table = new Table({
      head: ["ID", "Product", "Price"],
      colWidths: [10, 35, 15]
    });
    for (var i = 0; i < res.length; i++) {
      table.push(
        [res[i].item_id, res[i].product_name, res[i].price]
      );
    }
   console.log(table.toString());

   inquirer
    .prompt([{
        name: "item",
        type: "input",
        message: "What is the ID of the item you would like to buy? ",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          else {
            return false;
          }
        }
      },
      {
        name: "quantity",
        type: "input",
        message: "How many of the item do you want to buy?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          else {
            return false;
          }
        }
      }
    ])
    .then(function(answer) {
      if (answer.quantity <= res[answer.item-1].stock_quantity) {
        var newQuantity = (res[answer.item-1].stock_quantity) - answer.quantity;
        var updateId = answer.item;
        updateProduct(newQuantity, updateId);
        var totalPrice = res[answer.item-1].price * answer.quantity;
        console.log("\nTotal Price: " + parseFloat(totalPrice).toFixed(2));
        connection.end();
      }
      else {
        console.log("\n\nINSUFFICIENT QUANTITY!\n\n");
        customer();
      }
    });
  });
}

function updateProduct(newQuantity, updateId) {
  var query = connection.query("UPDATE products SET ? WHERE ?", [
    {
      stock_quantity: newQuantity
    },
    {
      item_id: updateId
    }], 
    function(err, res) {
      if (err) throw err;
      else {
        console.log("Purchase successful!\n")
      }

    }
  );
}