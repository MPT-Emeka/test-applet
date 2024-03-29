const express = require("express")
const Flutterwave = require("flutterwave-node-v3");
const Order = require("../models/orderModel");
//const OrderedItems = require("../models/orderedItems");
const nodemailer = require("nodemailer");
const Cart = require("../models/cartModel");
fs = require('fs');

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

//Checkout ordered foods
exports.checkoutOrder = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        let payload = req.body;
        
        let order = await Order.findOne({userId});
        
        let user = req.user;

        if(order) {
            payload = {
                ...payload, 
                enckey: process.env.FLW_ENCRYPT_KEY, 
                amount : order.orderAmount, 
                email : user.email, 
                fullname : user.name, 
                phone_number : user.phoneNumber,
                tx_ref: "hy_ " + Math.floor((Math.random() * 1000000000) + 1) 
            };
            
            const response = await flw.Charge.card(payload);
            
            if (response.meta.authorization.mode === 'pin') {
                let payload2 = payload
                payload2.authorization = {
                    "mode": "pin",
                    "fields": [
                        "pin"
                    ],
                    "pin": 3310
                }
                const reCallCharge = await flw.Charge.card(payload2)

                // Add the OTP to authorize the transaction
                const callValidate = await flw.Charge.validate({
                    "otp": "12345",
                    "flw_ref": reCallCharge.data.flw_ref
                })
                
                if(callValidate.status === 'success') {
                
                let mail = nodemailer.createTransport({
                    service : 'gmail',
                    auth : {
                        user : process.env.HOST_EMAIL,
                        pass : process.env.EMAIL_PASS
                    }
                });

                let mailOptions = {
                    from : process.env.HOST_EMAIL,
                    to : `${process.env.GULP_EMAIL}`,
                    subject : "Orders",
                    text : "Ordered drinks are as follows " + '\n' + order
                }
                
                mail.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent : ' + info.response);
                    }
                });
                
                let orderItems = await Order.find({userId});
                if (orderItems) {
                    orderItems.map(async orderItem => {
                        await Order.findByIdAndUpdate(orderItem._id, {
                            status : "completed",
                        });
                    });
                }

                let orderToDelete = await Order.findOne({userId});

                await orderToDelete.delete();

                let cartToDelete = await Cart.findOne({ _id : userId });
    
                  await cartToDelete.delete();

                return res.status(200).send({
                    status : "Payment successfully made",
                    message : "Your orders has been received", 
                    order  
                })
                } 
                if(callValidate.status === 'error') {
                    res.status(400).send("please try again");
                }
                else {
                    res.status(400).send("payment failed");
                }
            }

            
            if (response.meta.authorization.mode === 'redirect') {
    
                var url = response.meta.authorization.redirect
                open(url)
            }
        } else {
            res.status(400).send("Order not found");
        };
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    };
};
