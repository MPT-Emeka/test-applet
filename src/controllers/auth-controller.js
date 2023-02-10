const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Token = require("../models/token-model");
const { createToken } = require("../middlewares/authMiddleware");
const handleError = require("../helpers/errors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const cookie = require("cookie-parser");

//cookie-parser expiry date
const maxAge = 3 * 24 * 60 * 60;

//Create account for user
exports.signUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber, role } = req.body;
    if(!name && !email && !phoneNumber && !role && !password){
      return res.status(400).json({error: 'All fields are required'})
    }
 

    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
    }
    const salt = await bcrypt.genSalt(10);

    if (password === confirmPassword && password.length > 5) {
      const hash = await bcrypt.hash(password, salt);
      const user = await User.create({
        name,
        email,
        password: hash,
        confirmPassword: hash,
        phoneNumber,
        role,
      });

      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      await new Token({
        userId: user._id,
        token: token,
        createdAt: Date.now(),
      }).save();


      let mail = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : process.env.HOST_EMAIL,
            pass : process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from : process.env.HOST_EMAIL,
        to : user.email,
        subject : "User Sign-up",
        text : `Thankyou ${user.name} for signing up for gulp drinks service.`
    }
    
    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent : ' + info.response);
        }
    })

      return res.status(201).json({
        status: "success",
        token,
        data: {
          user,
        },
      });
    }
    return res
      .status(400)
      .json({ message: "Password is less than 6 characters" });
  } catch (error) {
    const errors = handleError(error);
    return res.status(404).json({ errors });
  }
};

//Log user in
exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        const token = await createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({
          status: "success",
          token,
          data: {
            user,
          },
        });
      } else {
        res.status(401).json({
          status: "fail",
          message: "Invalid email or password",
        });
      }
    }
  } catch (err) {
    const errors = handleError(err);
    res.status(400).json({
      status: "fail",
      message: errors,
    });
  }
};

//Logout
exports.logout = async (req, res) => {
  try {
    const token = "";
    res.cookie("jwt", token, { httpOnly: true, maxAge: 30 },); // decrease max age
    res.status(200).json({ message: "You've successfully logged out" }) //.redirect("/"); //add homepage url. 
  } catch (error) {
    res.status(404).json({ message: "Account not logged out" });
  }
};

const forgotPassword = async (req) => {
  try {
    const user = await User.findOne({ email : req.body.email });
    if (!user) return { message: "User does not exist" };
    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    let resetToken = crypto.randomBytes(32).toString("hex");

    const tokenReset = await new Token({
      userId: user._id,
      token: resetToken,
      createdAt: Date.now(),
    }).save();

    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auths/reset-password/${resetToken}`;
    const message = `To reset your password click on the link below to submit your new password: ${resetUrl}`;

    let mail = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : process.env.HOST_EMAIL,
            pass : process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from : process.env.HOST_EMAIL,
        to : user.email,
        message,
        subject : "Your password reset token. It's valid for 10mins",
        text : resetUrl
    }
    
    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent : ' + info.response);
        }
    })


    return ({
        status: "success",
        message: "Password reset url sent to your mail",
        resetUrl
    });


  } catch (error) {
    return res.status(400).json({ message: error }); //return
  }
};

const resetPassword = async (userId, token, password) => {
  try {
    const passwordResetToken = await Token.findOne({ userId });
    if (!passwordResetToken) {
      return res
        .status(400)
        .json({ message: "Invalid token or expired reset token" });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash, confirmPassword: hash } },
      { new: true }
  ); 
  return ({ "message": "You have successfully updated your Password." });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error });
  }
};

exports.forgotPasswordController = async (req, res, next) => {
  try {
    const forgotPasswordService = await forgotPassword(
      req
    );
    return res.status(200).json({ forgotPasswordService });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

exports.resetPasswordController = async (req, res, next) => {
  try {
    const resetPasswordService = await resetPassword(
      req.body.userId,
      req.body.token,
      req.body.password,
      req.body.confirmPassword
    );
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ "message": "Passwords do not match" });
    }
    return res.status(200).json(resetPasswordService); 
  } catch (error) {
    res.status(400).json({ "message": error });
  }
};


exports.deleteUser = async(req, res)=>{
  try{
    const deletedUser =  await User.findOneAndDelete({_id: req.user.id }); // check during postman test
    if(!deletedUser){
      await Token.findOneAndDelete({ userId : req.user.id});
      return res.status(400).json({message: "unable to delete account"})
    }
    return res.status(200).json({
      success: true,
      message:"account deleted"
    })
  }
  catch(error) {
    res.status(500).json({ message: error });
  }
}