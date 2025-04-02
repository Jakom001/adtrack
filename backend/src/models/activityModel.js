import mongoose, { models } from 'mongoose';

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim:true,
        lowercase: true,
    },
    description: {
        type: String,
        required: true,
        trim:true,
        lowercase: true,
    },
    comment: {
        type: String,
        trim:true,
        lowercase: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    projectId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now,
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