import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    goalId: {
        type: String,
        unique: true,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    goalName: {
        type: String,
        required: true
    },
    goalDescription: String,
    targetDate: {
        type: Date,
        required: true
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Achieved'],
        default: 'Not Started'
    }
}, { timestamps: true });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;