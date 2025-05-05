import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auth',
            required: true
        },
    title: {
        type: String,
        required: [true, "Title is required"],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;