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

const categorySchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    userId:Joi.string().required()
})

const projectSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    userId:Joi.string().required()
})

const activitySchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    Comment: Joi.string().optional(),
    status: Joi.string().required(),
    priority: Joi.string().required(),
    category: Joi.string().required(),
    project: Joi.string().required(),
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional(),
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
    acceptCodeSchema,
    changePasswordSchema,
    acceptFPSchema,

    companyValidator,
    categorySchema,
    projectSchema,
    activitySchema
};

