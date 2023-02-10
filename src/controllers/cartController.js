const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");

const checkQuantity = (products) => {
  let quantity = 0;
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    quantity += product.quantity;
  }
  return quantity;
};
const getSubtotal = (products) => {
  let subtotal = 0;
  for (let index = 0; index < products.length; index++) {
    const item = products[index];
    subtotal += item.subtotal;
  }
  return subtotal;
};

const addToCart = async (req, res) => {
  try {
    const user = req.user; // identify the user
    const productExist = await Product.findOne({
      _id: req.body.productId,
    }); //check if product to be added to the cart exists in the store
    if (!productExist) {
      return res.status(404).json({
        success: false,
        message: "product to be added to cart not found in store",
      }); //if product doesn't exist return the json response above
    }
    if (productExist.amountInStock === 0) {
        return res.status(400).json({
            success: false,
            message: "item is out of stock, you can check out other drinks."
        })
    }

    const cart = await Cart.findOne({ _id: user._id }); // find the user's cart
    if (cart) {
      // check if product already exists in cart
      let product = cart.products.find((item) => {
        if (item.productID === req.body.productId) {
          return item;
        } // transverse the array to find if product to be added in the array already exist in the cart
      });
      // ADD TO CART SECTION
      // CHECK IF PRODUCT ALREADY IN CART
      if (product) {
        console.log("product already exists in cart");
        // convert product quantity to a number
        let quantity = parseInt(req.body.quantity);
        // it's add specified quantity of product or adds 1 if quantity not specified
        product.quantity += quantity || 1;
        if (productExist.amountInStock < product.quantity) {
            return res.status(401).send({
                status: false,
                message: "Item is temporarily out of stock"
            })
        }
        // this calculates the subtotal cost of product
        product.subtotal = product.quantity * productExist.price;
       
        cart.itemCount = checkQuantity(cart.products);

        cart.totalPrice = parseInt(getSubtotal(cart.products));
        cart.save(cart, (err, cart) => {
          if (err) {
            return res.status(400).json({
              success: false,
              message: err.message,
            });
          } else {
            if (cart.itemCount >= 10) {
                return res.status(200).json({
                    success: true,
                    complimentary: "Disposable Cups included",
                    message: "Cart updated",
                    cart: cart,
                  });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "Cart updated",
                    cart: cart,
                  });
            }  
          }
        });
      } else {
        // user has cart but doesnt have product in his cart
        cart.products.push({
          productID: req.body.productId,
          product: req.body.productId, //change this to product: productExist
          quantity: req.body.quantity || 1,
          subtotal: productExist.price * (req.body.quantity || 1),
        });
        cart.itemCount = checkQuantity(cart.products);
        cart.totalPrice = getSubtotal(cart.products);
        cart.save((err, cart) => {
          if (err) {
            return res.status(400).json({
              success: false,
              message: err.message,
            });
          } else {
            if (cart.itemCount >= 10) {
                return res.status(200).json({
                    success: true,
                    message: "Cart updated",
                    complimentary: "Disposable Cups included",
                    cart: cart,
                  });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "Cart updated",
                    cart: cart,
                  });
            }
          }
        });
      }
    }
    // if user has no cart, create one
    else {
      console.log("user has no cart, create one");
   // productExist.set('productCounter', undefined, {strict: false} );
      const cart = new Cart({
        _id: user._id,
        products: [
          {
            productID: req.body.productId,
            product: req.body.productId, 
            quantity: req.body.quantity || 1,
            price: productExist.price,
            subtotal: productExist.price * (req.body.quantity || 1),
          },
        ],
        itemCount: req.body.quantity || 1,
        totalPrice: productExist.price * (req.body.quantity || 1),
      });

      cart.save((err, cart) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        } else {
          return res.status(200).json({
            success: true,
            message: "Cart created",
            cart: cart,
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const user = req.user; // identify the user
    const productExist = await Product.findOne({
      _id: req.body.productId,
    }); //check if product to be removed from the cart exists in the store
    if (!productExist) {
      return res.status(404).json({
        success: false,
        message: "product to be removed from cart not found in store",
      }); //if product doesn't exist return the json response above
    }
    const cart = await Cart.findOne({ _id: user._id }); // find the user's cart
    if (cart) {
      console.log("user has a cart");
      // check if product already exists in cart              
      let product = cart.products.find((item) => {                 // or let product = cart.find({ products: req.body.productId })
        if (item.productID === req.body.productId) {
          return item;
        }
      }); 
      // REMOVE TO CART SECTION
      // CHECK IF PRODUCT ALREADY IN CART
      if (product != undefined) {
        let quantity = parseInt(req.body.quantity); // convert product quantity to a number or we can remove this line.
        if (cart.products.length === 1 && product.quantity === 1) {
          await Cart.findOneAndDelete({ _id: user._id });
          return res.status(200).json({
            success: true,
            message: "Product and Cart deleted",
            cart: cart,
          });
        }
        if (product.quantity == 1) {
          cart.products.splice(cart.products.indexOf(product), 1);
          product.subtotal = product.quantity * productExist.price;
          cart.itemCount = checkQuantity(cart.products);
          cart.totalPrice = getSubtotal(cart.products);
        } else {
        // it's subtracts specified quantity of product or subtracts 1 if quantity not specified
          product.quantity -= quantity || 1;
          product.subtotal = product.quantity * productExist.price;
          cart.itemCount = checkQuantity(cart.products);
          cart.totalPrice = getSubtotal(cart.products);
        }
        cart.save(cart, (err, cart) => {
            if (err) {
                return res.status(400).json({
                success: false,
                message: err,
                });
            } else {
                if (cart.itemCount >= 10) {
                    return res.status(200).json({
                        success: true,
                        message: "product deleted from cart successfully",
                        complimentary: "Disposable Cups included",
                        cart: cart,
                        }); 
                }
                return res.status(200).json({
                success: true,
                message: "product deleted from cart successfully",
                cart: cart,
                });
            }
            });
      } else {
            return res.status(409).json({
            success: false,
            message: "cannot delete, this product is not in your cart ",
            });
        }
        
    } 
    // if user has no cart
    else {
      return res
        .status(409)
        .json({ success: false, message: "You do not have a cart" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



const getCart = async (req, res) => {
  try {
    const user = req.user;
    // check if cart exists
    let cart = await Cart.findOne({
      _id: user.id,
    });
    if (cart) {
        if (cart.itemCount >= 10) {
            return res.json({
                success: true,
                message: "Cart retrieved",
                complimentary: "Disposable Cups included",
                cart: cart,
              });
        } else {
            return res.json({
                success: true,
                message: "Cart retrieved",
                cart: cart,
              });
        };
    } else {
      return res.json({
        success: false,
        message: "Cart does not exist",
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "server Error: " + error.message, success: false });
  }
};

const deleteCart = async (req, res) => {
  try {
    // check if cart exists
    const user = req.user;

    const cart = await Cart.findOne({ _id: user._id }); // find the user's cart
    if (cart) {
     // console.log("user has a cart");

    const deletedCart = cart.delete();
    if (!deletedCart) {
      return res.status(404).json({
        success: false,
        message: " Cart could be not be deleted",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "cart deleted successfully",
      });
    }
    } else {
            return res.status(404).send({
                status: false,
                message: "Cart not found"
            })
        }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getCart,
  removeFromCart,
  addToCart,
  deleteCart,
  getSubtotal,
  checkQuantity,
};
