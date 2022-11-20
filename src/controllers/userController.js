const express = require("express");
const User = require("../models/userModel");
const ErrorHandler = require("../helpers/userErrorHandler");
const QueryMethod = require("../helpers/query")

exports.updateUser = async (req, res) => {
  try {
  
    const id = req.params.id;
    const user = req.user; // identify the user
    const userId = user._id
    if (!userId) {   // !user && 
      return res
        .status(403)
        .json({ success: false, message: "unauthorized user" });
    }

    const findUser = await User.findById(id);
    findUser.name = req.body.name;
    findUser.email = req.body.email;
    await findUser.save();
    return res.status(200).send({
      status: true,
      message: "Account has been updated successfully",
      updatedUser: findUser,
    });
  } catch (err) {
    const error = ErrorHandler.handleErrors(err);
    res.status(404).json({ error });
  }
};

exports.getUser = async (req, res) => {
  try {

    const id = req.params.id;
    const user = req.user; // identify the user
    const userId = user._id
    if (!userId) {   // !user && 
      return res
        .status(403)
        .json({ success: false, message: "unauthorized user" });
    }

    const findOneUser = await User.findById(id);
    if (!findOneUser) {
      return res.status(404).send({
        status: false,
        message: "User not found",
      });
    } else {
      return res.status(200).send({
        status: true,
        message: "User found",
        User: findOneUser,
      });
    }
  } catch (err) {
    if (err.path === "_id") {
      return res.status(401).send({
        status: false,
        message: "Invalid ID",
      });
    } else {
      return res.status(500).send({
        status: false,
        message: "Server Error",
      });
    }
  }
};

exports.getAllUsers = async (request, response) => {
  try {

    const user = request.user
    const userId = user._id
    if (!userId) {  
      return response
      .status(403)
      .json({ success: false, message: "unauthorized user" });
    }  

    if (user.role.includes("user")) {
        return response.status(400).send({
            status: false,
            message: "only gulp admins can fetch all users"
        })
    };

    let queriedUsers = new QueryMethod(User.find(), request.query)
      .sort()
      .filter()
      .limit()
      .paginate();
    let users = await queriedUsers.query;
    response.status(200).json({
      status: true,
      message: "Users found",
      count: users.length,
      allUsers: users,
    });



    // const findAllUsers = await User.find();
    // return response.status(200).send({
    //   status: true,
    //   message: "Users found",
    //   AllUsers: findAllUsers,
    // });
  } catch (err) {
   // console.log(err);
    return response.status(404).send({
      status: false,
      message: "No users found",
    });
  }
};

exports.deleteUser = async (request, response) => {
  try {

    const user = request.user
    const userId = user._id
    if (!userId) {  
      return response
      .status(403)
      .json({ success: false, message: "unauthorized user" });
    }  

    // const user = await User.findById(request.headers.id);
     if (user.role.includes("user")) {
         return response.status(400).send({
             status: false,
             message: "only gulp admins can delete users"
         })
     }



    const { id } = request.query;
    const findUser = await User.findByIdAndDelete(id);
    if (findUser) {
      return response.status(200).send({
        status: true,
        message: "User deleted successfully",
        deletedUser: findUser,
      });
    } else {
      return response.status(404).send({
        status: false,
        message: "User not found",
      });
    }
  } catch (error) {
    return response.status(400).json({ error })
  };
};
