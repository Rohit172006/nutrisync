const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const db = require("./config/db");

const app = express();
const PORT = 5000;
const SECRET = "nutrisyncsecret"; // Use env variable in production

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// SIGNUP
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                return res.status(500).json({ message: "Database error" });
            }

            // Generate token for auto-login after signup
            const userId = result.insertId;
            const token = jwt.sign({ id: userId, email }, SECRET, { expiresIn: "1h" });

            res.json({
                message: "Signup successful",
                token
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// LOGIN
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });

        res.json({
            message: "Login successful",
            token
        });
    });
});

// PROFILE COMPLETION
app.post("/profile", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        const userId = decoded.id;

        const { age, weight, gender, height, diseases, allergies, fitness_goal } = req.body;

        // Basic validation
        if (!age || !weight || !gender || !height || !fitness_goal) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const sql = `UPDATE users 
                     SET age = ?, weight = ?, gender = ?, height = ?, 
                         diseases = ?, allergies = ?, fitness_goal = ? 
                     WHERE id = ?`;

        db.query(sql, [age, weight, gender, height, diseases || null, allergies || null, fitness_goal, userId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database error" });
            }
            res.json({ message: "Profile updated successfully" });
        });
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});