import mongoose from "mongoose";

const featureSchema = new mongoose.Schema({
    name :{
        type: String,
        trim: true,
        lowercase:true,
        required : [true,'name is Required']
    },
    type: {
        type: String,
        enum:['feature','bugFix', 'improvement', 'other' ],
        default: 'feature'
    },
    priority:{
        type: String,
        enum:['High', 'Medium', 'Low'],
        default: 'Medium',
    },
    image:{
        type: String,
        trim: true
    },
    description:{
        type: String,
        trim:true,

    }
},{
    timestamps: true
}
)

const Feature = mongoose.model('Feature', featureSchema)

export default Feature