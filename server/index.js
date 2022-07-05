const keys = require("./keys");

// Express Application setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres client setup
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on("connect", client => {
  client
    .query(
      `CREATE TABLE IF NOT EXISTS orders (
        ID SERIAL PRIMARY KEY,
        product_id VARCHAR(255), 
        quantity INT, 
        created TIMESTAMP 
      )`
    )
    .catch(err => console.log("PG ERROR", err));
});

//Express route definitions
app.get("/orders", (req, res) => {
  pgClient.query('SELECT * FROM orders ORDER BY created;', [], (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    res.send(JSON.stringify(results.rows));
  });

});

// now the post -> insert value
app.post("/checkout", async (req, res) => {
  if (!req.body.quantities) res.send({ success: false });
  for(var i in req.body.quantities) {
    await pgClient.query(
      "INSERT INTO orders(product_id, quantity, created) VALUES($1, $2, $3)", 
      [i, req.body.quantities[i], new Date().toISOString()]
    );
  };
  res.send({ success: true });
});

app.listen(5000, err => {
  console.log("Listening");
});
