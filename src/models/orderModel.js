const mongoose = require("mongoose"); //removed productModel imported. 

const OrderSchema = new mongoose.Schema(
  {
   userId: { type: String, 
    required: [true, "Input a valid userId"] },


    cart : 
      [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
        autopopulate: true
      }],
    
    address: { type: String,
               required: true },

    status: { type: String, 
              default: "pending" },
    complimentary: {
        type: String,
        default: "No Complimentary Service",
    },
    orderAmount: { 
        type: Number,
    }
  },
  { timestamps: true }
);

OrderSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("Order", OrderSchema);