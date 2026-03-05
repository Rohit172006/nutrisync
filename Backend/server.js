const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

const SECRET = "nutrisyncsecret";


// SIGNUP
app.post("/signup", async (req, res) => {

  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (name,email,password) VALUES (?,?,?)";

  db.query(sql, [name, email, hashedPassword], (err, result) => {

    if (err) {
      return res.status(400).json({ message: "User already exists" });
    }

    res.json({ message: "Signup successful" });

  });
});


// LOGIN
app.post("/login", (req, res) => {

  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {

    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const user = result[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });

    res.json({
      message: "Login successful",
      token
    });

  });
});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});