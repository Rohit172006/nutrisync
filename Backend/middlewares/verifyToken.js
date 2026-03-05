const jwt = require("jsonwebtoken")

const verifyToken = (req,res,next) => {

    const header = req.headers["authorization"]

    if(!header){
        return res.status(403).json({message:"Token required"})
    }

    const token = header.split(" ")[1]

    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{

        if(err){
            return res.status(401).json({message:"Invalid token"})
        }

        req.user = user
        next()
    })
}

module.exports = verifyToken