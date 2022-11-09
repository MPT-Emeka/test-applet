const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

//Token generator
exports.createToken = (id) => {
    return jwt.sign(
        {id}, 
        JWT_SECRET, 
        { expiresIn : JWT_EXPIRES_IN }
    )
};

//Authorize users
exports.auth = async (req, res, next) => {
    try {
      let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if(!token){
        return res.status(401).json({
            message: "Not logged In",
        });
    }
    const userJWTData = await jwt.verify(token, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
      const user = await User.findById(userJWTData.id);
    
      req.user = user;
      next();
    } catch (error) {
        return res.status(400).json({
            message: "authentication failed"
        });
  
    }
};

//Check if user is logged in
exports.checkUser = (...roles) => {
    return async (req, res, next) => {
    if (!req.user.role.includes(...roles)) {
        return res.status(401).json({
        message: "You are not authorized to do this",
        });
    }
    next();
  };
};
