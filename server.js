// Project Setup
const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// Database Setup
const db_name = path.join(__dirname, "data", "adverts.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'adverts.db'");
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

// Start Application
app.listen(3000, () => console.log("Application Running on Port 3000"));

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
    // if (err) ...
    res.render("edit", { model: row });
  });
});

app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const adverts = [req.body.Title, req.body.Price, req.body.Description, id];
  const sql = "UPDATE adverts SET Title = ?, Price = ?, Description = ? WHERE (ITEM_ID = ?)";
  db.run(sql, adverts, err => {
    // if (err) ...
    res.redirect("/adverts");
  });
});

// Create Item
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

app.post("/create", (req, res) => {
  const sql = "INSERT INTO adverts (Title, Price, Description) VALUES (?, ?, ?)";
  const adverts = [req.body.Title, req.body.Price, req.body.Description];
  db.run(sql, adverts, err => {
    // if (err) ...
    res.redirect("/adverts");
  });
});

// GET /delete/5
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM adverts WHERE ITEM_ID = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("delete", { model: row });
  });
});

// POST /delete/5
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM adverts WHERE ITEM_ID = ?";
  db.run(sql, id, err => {
    // if (err) ...
    res.redirect("/adverts");
  });
});