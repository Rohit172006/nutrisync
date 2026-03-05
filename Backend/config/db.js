const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rohit170306",
  database: "nutrisync_ai"
});

db.connect(err => {
  if (err) {
    console.log("Database connection failed");
  } else {
    console.log("Connected to MySQL");  
  }
});

module.exports = db;