import mongoose, { models } from 'mongoose';

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;