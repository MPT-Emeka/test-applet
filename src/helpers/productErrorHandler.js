const productErrorHandler = (err) => {
  console.log(err.message);
  let error = {
    productName: "",
    category: "",
    subCategory: "",
    gulp: "",
    price: "",
    brand: "",
    description: "",
    expiryDate: "",
    timestamps: "",
  };

  if (err.message.includes("product validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      error[properties.path] = properties.message;
    });
  }
  return error;
};

module.exports = productErrorHandler;
