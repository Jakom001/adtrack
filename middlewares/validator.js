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

const acceptCodeSchema = Joi.object({
    email: Joi.string().email().required(),
    providedCode: Joi.number().required(),
})

const checkConnectionExpiryDate = Joi.object({
    connectionExpiryDate: Joi.date().iso().required(),
})

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({ "any.only": "Passwords must match" }),
})

const acceptFPSchema = Joi.object({
    email: Joi.string().email().required(),
    providedCode: Joi.number().required(),
    newPassword: Joi.string().required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({ "any.only": "Passwords must match" }),
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

const activitiesValidator = Joi.object({
    activityName: Joi.string().required(),
    activityDescription: Joi.string().required(),
    activityType: Joi.string().required(),
    activityDate: Joi.date().iso().required(),
})

const goalsValidator = Joi.object({
    goalName: Joi.string().required(),
    goalDescription: Joi.string().required(),
    goalType: Joi.string().required(),
    goalDate: Joi.date().iso().required(),
})

export{
    registerSchema,
    loginSchema,
    acceptCodeSchema,
    changePasswordSchema,
    acceptFPSchema,
    companyValidator,
    checkConnectionExpiryDate,
};

