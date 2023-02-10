const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Flutterwave = require("flutterwave-node-v3");
const nodemailer = require("nodemailer");
fs = require('fs');



                // This updates the stock of the products in store after an order has been created. 
                const updateStock = async (products) => {
                  // let quantity = 1;
                   let productExist2;
                   for (let index = 0; index < products.length; index++) { // or add index <= length
                   const product = products[index];
                 // quantity += product.quantity;
                   productExist2 = await Product.findById(product.productID) 
                       if(productExist2.amountInStock < product.quantity) {
                           return res.status(401).send({
                               status: false,
                               message: `This ${productExist2.productName} is temporarily out of stock`
                           })
                       } else {
                           productExist2.amountInStock -= product.quantity || 1; // pEs = pEs - 1
                   await productExist2.save();
                   }
               }
               return productExist2;
               };



// CREATE AN ORDER
const createOrder =  async (req, res) => {
  try {
    const user = req.user; // identify the user
    const userId = user._id
         if(user)
         {
            const orderCart = await Cart.findOne({
                _id: req.body.cartId
            });
            if (!orderCart) {
                return res.status(404).send({
                    status: false,
                    message: "cart not found"
                })
            };
            updateStock(orderCart.products);

            // Order is saved to the DB below

            if (orderCart.itemCount >= 10){
              const newOrder = new Order({
                userId: userId , 
                cart: [orderCart],
                address: req.body.address,
                complimentary: "Disposable Cups Included",
                orderAmount: orderCart.totalPrice
            });
            const savedOrder = await newOrder.save();
            return res.status(200).json({
              message: "Order created Successfully!",
              return : savedOrder});

              } else {
                  const newOrder = new Order({
                    userId: userId , 
                    cart: [orderCart],
                    address: req.body.address,
                    orderAmount: orderCart.totalPrice
                  });
                  const savedOrder = await newOrder.save();
                  return res.status(200).json({
                  message: "Order created Successfully!",
                  return : savedOrder});
              }
         } else {
            return res.status(404).json({
            message: "Invalid User!",
         })
       }
    }
     catch (err) {
     console.log(err) 
     return res.status(500).json(err);
    }                                                                                                       
};


 //UPDATE ORDER
 const updateOrder = async (req, res) => {
  try {

    const user = req.user; // identify the user
    const order = await Order.findOne({user});
    if(order)
         {
          order.address = req.body.address;
          const orderRet = await order.save();
          return res.status(200).send({
               status: true,
               message: "Order has been updated successfully",
               updatedOrder: orderRet,
             })
            }else
          {
           return res.status(404).json({
             message: "Order Not Found! "
          })
             }
        }catch (err) {
          return res.status(500).json(err);
      }}
    
       

 //DELETE AN ORDER
 const deleteOrder = async (req, res) => {
    try {
      const orderId = req.body.orderId;
      const order = await Order.findById(orderId) // Order.findOne({ userId: orderId }); 
        if (!order) {
            return res.status(400).json({
                status: 'fail',
                message: `Order with Id: ${orderId} does not exist!`
            })
        }else {
      await Order.findByIdAndDelete(orderId)
       return  res.status(200).json({
            message: 'Order deleted successfully'
        })};
    } catch (err) {
       return res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}  


// GET ONE USER ORDER
const getUserOrder = async (req, res) => {
    try {

      const user = req.user; // identify the user
      //const userId = user._id

        const order = await Order.findOne({ userId: user._id })
        console.log(order)
        if(order) {
            return res.status(200).json({
            data: order
        })
        } else {
          return res.status(404).json({
            message: "order not found"
        })
        };
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}

 //GET ALL ORDERS
const getAllOrders = async (req, res) => {
    try {
      const user = req.user; 
      const userId = user._id
      if (!userId) {  
        return res
        .status(403)
        .json({ success: false, message: "unauthorized user" });
      }  

        const order = await Order.find({});
        return res.status(200).json({
            message: "All Orders have been retrieved!",
            data: [order],
            results: order.length
          });
      } catch (err) {
        return res.status(404).json({
            message: " Error!",
            data: err});
      }
    };

 module.exports = {createOrder , getAllOrders, getUserOrder, updateOrder, deleteOrder}