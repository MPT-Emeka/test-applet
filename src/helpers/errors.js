//handle errors
const handleError = (err) => {
    console.log(err.message);
    let errors = { name : "", email : "", password : "", confirmPassword : ""};

    //duplicate error code
    if(err.code === 11000) {
        errors.email = "email already registered";

        return errors;
    }
    
    //validate errors
    if(err.message.includes('User validation failed' )) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        })
    }

    return errors;
}

module.exports = handleError;