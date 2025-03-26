import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Company Name is required"]
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "Email is required"],
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    phone: {
        type: String,
        required: [true, "Phone Number is required"],
        trim: true,
    },
    address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
    },
    city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
    },
    country: {
        type: String,
        required: [true, "State is required"],
        trim: true,
    },
    website: {
        type: String,
        trim: true,
    },
    industry: {
        type: String,
        required: [true, "Industry is required"],
        trim: true,
    },
    logo: {
        type: String,
        required: [true, "Logo is required"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    

},
    { timestamps: true }
)

export default mongoose.model('Company', companySchema);