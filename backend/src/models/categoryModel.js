import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auth',
            required: true
        },
    active:{
        type: Boolean,
        default: true,
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
    }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;