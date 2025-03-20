import Joi from 'joi';

const registerSchema = Joi.object({
    firstName: Joi.string().required().min(3),
    lastName: Joi.string().required().min(3),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({ "any.only": "Passwords must match" }),
    phone: Joi.string().min(10).required(),
})

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
})

const checkConnectionExpiryDate = Joi.object({
    connectionExpiryDate: Joi.date().iso().required(),
})

const companyValidator = Joi.object({
    companyName: Joi.string().required(),
    industry: Joi.string().required(),
    website: Joi.string().uri().required(),
    logo: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    description: Joi.string().required(),

})



export{
    registerSchema,
    loginSchema,
    companyValidator,
    checkConnectionExpiryDate,
};


