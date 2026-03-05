const express = require("express")
const router = express.Router()

const {
register,
login,
refresh,
logout
} = require("../controllers/authcontroller")

const verifyToken = require("../middlewares/verifyToken")

router.post("/register",register)
router.post("/login",login)
router.post("/refresh",refresh)
router.post("/logout",logout)

router.get("/profile",verifyToken,(req,res)=>{
    res.json({
        message:"Protected route",
        user:req.user
    })
})

module.exports = router