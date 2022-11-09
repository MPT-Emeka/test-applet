const Product = require("../models/productModel");


exports.recommendDrinks = async (req, res) => {
    try {
        //const recommend = req.body.occasion;
        const findReco = await Product.find({ occasion: req.body.occasion })
        if (findReco) {
          return res.status(200).json({
              status: true,
              message: "Drinks recommended",
              drinksRecommended: findReco
          })
        } else {
            return res.status(400).send({
                status: true,
                message: "Nothing to recommend yet",
            })
        } 
    } catch (err) {
        console.log(err)
        return res.status(401).send({
        status: false,
        message: "Invalid input",
        });
    }
} 
