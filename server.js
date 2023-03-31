// Project Setup
const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const validator = require("validator");
const helmet = require("helmet");
const morgan = require('morgan'); // Logging
require("dotenv").config();

// logging
app.use(morgan("combined"));

// Prevent CSS
app.use(helmet());

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// Database
const db_name = path.join(__dirname, "data", process.env.DB_NAME);
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log(`Successful connection to the database '${db_name}'`);
});

const sql_create = `CREATE TABLE IF NOT EXISTS adverts (
    ITEM_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Title VARCHAR(100) NOT NULL,
    Price VARCHAR(100) NOT NULL,
    Description TEXT
  );`;

db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'adverts' table");
});

// Server
const port = process.env.PORT;
app.listen(port, () => console.log(`Application Running on Port ${port}`));

app.get("/", (req, res) => {
  res.redirect("/adverts");
});

// View Adverts
app.get("/adverts", (req, res) => {
  const sql = "SELECT * FROM adverts ORDER BY Title"
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("adverts", { model: rows });
  });
});

// Edit Item
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM adverts WHERE ITEM_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit", { model: row });
  });
});

app.post("/edit/:id", (req, res) => {
  const title = validator.escape(req.body.Title);
  const price = validator.escape(req.body.Price);
  const description = validator.escape(req.body.Description);
  // Check for missing title
  if (!title) {
    return res.status(400).send("Please provide a title for your advert");
  }

  // Check for invalid price
  if (!validator.isNumeric(price)) {
    return res.status(400).send("Please provide a valid price for your advert");
  }

  // Check for invalid description
  if (!validator.isLength(description, { min: 10 })) {
    return res.status(400).send("Please provide a description that is at least 10 characters long");
  }
  const id = req.params.id;
  const adverts = [title, price, description];
  const sql = "UPDATE adverts SET Title = ?, Price = ?, Description = ? WHERE (ITEM_ID = ?)";
  db.run(sql, adverts, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/adverts");
  });
});

// Create Item
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

app.post("/create", (req, res) => {
  //Validation  
  const title = validator.escape(req.body.Title);
  const price = validator.escape(req.body.Price);
  const description = validator.escape(req.body.Description);
  // Check for missing title
  if (!title) {
    return res.status(400).send("Please provide a title for your advert");
  }

  // Check for invalid price
  if (!validator.isNumeric(price)) {
    return res.status(400).send("Please provide a valid price for your advert");
  }

  // Check for invalid description
  if (!validator.isLength(description, { min: 10 })) {
    return res.status(400).send("Please provide a description that is at least 10 characters long");
  }
  const sql = "INSERT INTO adverts (Title, Price, Description) VALUES (?, ?, ?)";
  const adverts = [title, price, description];
  db.run(sql, adverts, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/adverts");
  });
});

// GET /delete/5
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM adverts WHERE ITEM_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete", { model: row });
  });
});

// POST /delete/5
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM adverts WHERE ITEM_ID = ?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/adverts");
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).send("Something broke!");
});