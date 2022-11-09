const Product = require("../models/productModel");
const User = require('../models/userModel')
const productErrorHandler = require("../helpers/productErrorHandler");
const { response } = require("../../app");



exports.createProduct = async (request, response) => {  
  try {
    const user = await User.findById(request.body.gulp);
    if (user.role.includes("user")) {
        return response.status(400).send({
            status: false,
            message: "only gulp admins can upload drinks"
        })
    }
    const productCt = await Product.findOne({ productName: request.body.productName }); 
    if (user && productCt) {  
      productCt.amountInStock += 1;
      await productCt.save();
      return response.status(201).send({
        status: true, // check
        message: "product count has been increased successfully",
        productCtToReturn: productCt 
      })
    } else if (user && !productCt) {
        const product = new Product(request.body)
        await product.save();
        return response.status(201).send({
                status: true, // check
                message: "product has been uploaded successfully",
                productToReturn: product,
        })
    } else {
        return response.status(400).send({
            status: false,
            message: "only gulp admins can upload drinks"
        })
    }
  } catch (error) {
    const err = productErrorHandler(error);
    return response.status(404).json({ err });
  }
};

exports.updateProduct = async (request, response) => {
  try {
    const user = await User.findById(request.headers.id);
    if (user.role.includes("user")) {
        return response.status(400).send({
            status: false,
            message: "only gulp admins can update drinks"
        })
    }

    const findProduct = await Product.findById(request.params.id);
    console.log(findProduct)
    if (findProduct) {
      findProduct.price = request.body.price;
      findProduct.description = request.body.description;
      await findProduct.save();
      return response.status(200).send({
        status: true,
        message: "Product has been updated successfully",
        updatedProduct: findProduct,
      });
    } else {
      return response.status(404).send({
        status: false,
        message: "Product not found",
      });
    }
  } catch (error) {
    const err = productErrorHandler(error);
    return response.status(400).json({ err });
  }
};

exports.getProduct = async (request, response) => {
    try {
      const id = request.params.id;
      const findOneProduct = await Product.findById(id);
      
      if (!findOneProduct) {
        return response.status(404).send({
          status: false,
          message: "Product not found",
        });
      } else {
        return response.status(200).send({
          status: true,
          message: "Product found",
          productToReturn: findOneProduct,
        });
      }
    } catch (err) {
        return response.status(401).send({
        status: false,
        message: "Invalid input",
        });
    }
  } 

exports.getProductListing = async (request, response) => {
    try {

      const findAllProduct = await Product.find();
      return response.status(200).send({
        status: true,
        message: "Product Listing",
        productListing: findAllProduct,
        counts: findAllProduct.length,
        productCounter: findAllProduct.amountInStock // check 
      });
    } catch (error) {
      const err = productErrorHandler(error);
      return response.status(400).json({ err });
    }
  }


exports.deleteProduct = async (request, response) => {
  try {
    const user = await User.findById(request.headers.id);
    if (user.role.includes("user")) {
        return response.status(400).send({
            status: false,
            message: "only gulp admins can delete drinks"
        })
    }
    const { id } = request.query;
    const findProduct = await Product.findById(id)
    if(findProduct) {
        if (findProduct.amountInStock >= 1) {
      findProduct.amountInStock -= 1;
      await findProduct.save();
      return response.status(200).send({
        status: true,
        message: `A bottle of ${findProduct.productName} deleted successfully`,
        deletedProduct: findProduct,
      });
    }else if (findProduct.amountInStock === 0){
      findProduct.delete();
      return response.status(200).send({
        status: true,
        message: "Product deleted successfully",
        deletedProduct: findProduct,
      })
    };
    } else {
      return response.status(404).send({
        status: false,
        message: "Product not found",
      });
    };
  } catch (error) {
    const err = productErrorHandler(error);
    return response.status(400).json({ err });
  }
};
