import mongoose, { models } from 'mongoose';


const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    whatTodo:{
        type: String,
        required: true,
    },
    whatHaveDone: {
        type: String,
        required: true,
    },
    comment: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    breakTime: {
        type: Number,
        default: 0
    }, 
    duration: {
        type: Number
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    tags: [{
        type: String
    }]
}, { timestamps: true });

activitySchema.pre('save', function(next) {
    if (this.startTime && this.endTime) {
        this.duration = ((this.endTime - this.startTime) / (1000 * 60*24)) - this.breakTime; // Duration in hours
    }
    next();
});

const Activity = mongoose.model('Activity', activitySchema);
const Category = mongoose.model('Category', categorySchema);

export {Activity, Category};
   