import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;