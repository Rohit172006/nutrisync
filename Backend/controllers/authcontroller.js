const express = require("express");
const router = express.Router();
const db = require("./config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// REGISTER
router.post("/register", async (req,res)=>{

const {name,email,password} = req.body;

const hash = await bcrypt.hash(password,10);

db.query(
"INSERT INTO users(name,email,password) VALUES(?,?,?)",
[name,email,hash],
(err,result)=>{

if(err){
return res.status(400).json({message:"User already exists"});
}

res.json({message:"User registered"});
}

);

});



// LOGIN
router.post("/login",(req,res)=>{

const {email,password} = req.body;

db.query(
"SELECT * FROM users WHERE email=?",
[email],
async (err,result)=>{
    
if(result.length===0){
return res.status(400).json({message:"User not found"});
}

const user = result[0];

const match = await bcrypt.compare(password,user.password);

if(!match){
return res.status(400).json({message:"Wrong password"});
}

const token = jwt.sign(
{id:user.id,email:user.email},
process.env.JWT_SECRET,
{expiresIn:"1h"}
);

res.json({token});

}

);

});

module.exports = router;