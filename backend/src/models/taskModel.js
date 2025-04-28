import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
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
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    project:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    startTime: {
        type: Date,
        

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
        enum: ['Pending', 'In_progress', 'Completed'],
        default: 'Pending'
    },
   
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;