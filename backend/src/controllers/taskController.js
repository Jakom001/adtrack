import Task from '../models/taskModel.js';
import Project from '../models/projectModel.js';
import Category from '../models/categoryModel.js';
import { taskSchema } from '../middlewares/validator.js';
import Auth from '../models/authModel.js';
import mongoose from 'mongoose'

const allTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate([
                {
                    path: 'categoryId',
                    select: 'title'
                },
                {
                    path: 'projectId',
                    select: 'title'
                }
            ]);
        
        res.status(200).json({
            status: 'true',
            length: tasks.length,
            message: 'Tasks fetched successfully',
            data: {
                tasks
            }
        });
    } catch (error) {
        console.log("All Tasks error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the tasks"
        });
    }
}

const searchTasks = async (req, res) => {
    try {
      const searchTerm = req.query.q;
      
      if (!searchTerm) {
        return res.status(400).json({
          status: 'false',
          error: 'Search query is required'
        });
      }
  
      // Create a regex for case-insensitive search
      const searchRegex = new RegExp(searchTerm, 'i');
      
      // Search in both title and description
      const tasks = await Task.find({
        user: req.user.userId, 
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      }).sort({ createdAt: -1 }).populate({
        path: 'user',
        select: 'firstName'
      });
      
      res.status(200).json({
        status: 'true',
        length: tasks.length,
        message: 'Tasks search completed',
        data: categories
      });
    } catch (error) {
      console.log("Search Tasks error", error);
      res.status(500).json({
        status: 'false',
        error: "Error searching for tasks"
      });
    }
  };

const addTask = async (req, res) => {
    const { title, description, comment, status, categoryId, projectId, startTime, endTime, breakTime,  userId} = req.body;
    
    try {
        const { error } = taskSchema.validate({ 
            title, description, categoryId, projectId, startTime, 
            endTime, breakTime,  comment, userId, status, 
        });
        
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return res.status(400).json({ error: 'Invalid user ID format' });
        }
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID format' });
        }
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: 'Invalid category ID format' });
        }
        const checkProject = await Project.findById(projectId)
        if(!checkProject){
            return res.status(404).json({success:false, error: "Invalid  project Id"})
        }
        const checkCategory = await Category.findById(projectId)
        if(!checkCategory){
            return res.status(404).json({success:false, error: "Invalid  project Id"})
        }
        const loginUser = await Auth.findById(userId)
        if(!loginUser){
            return res.status(404).json({success:false, error: "Invalid login user"})
        }
        let duration;
        if (endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            // Duration in milliseconds minus break time (converted to milliseconds)
            duration = (end - start) - (breakTime * 60 * 1000);
            
            // Ensure duration is not negative
            if (duration < 0) {
                return res.status(400).json({ error: 'End time must be after start time, accounting for breaks' });
            }
            // Convert to hours
            duration = Math.floor(duration / (24 * 60 * 1000));
        }
        
        // Set status based on endTime
        // const status = endTime ? 'Completed' : 'In Progress';
        
        const newTask = await Task.create({
            title,
            description,
            comment,
            category: categoryId,
            project: projectId,
            startTime,
            endTime,
            breakTime,
            duration,
            status,
            user:userId
        });
        
        res.status(201).json({
            status: 'true',
            message: 'Task created successfully',
            data: {
                task: newTask
            }
        });
    } catch (error) {
        console.log("Create Task error", error);
        res.status(400).json({
            status: 'false',
            message: "Error creating the task"
        });
    }
}


const singleTask = async (req, res) => {
    try {
        const task = await Task.findOne({ 
            id: req.params.id,
            user: req.user.userId
        }).populate([
            {
                path: 'categoryId',
                select: 'title'
            },
            {
                path: 'projectId',
                select: 'title'
            }
        ]);
        
        if (!task) {
            return res.status(404).json({
                status: 'false',
                error: "Task not found"
            });
        }
        
        res.status(200).json({
            status: 'true',
            message: 'Task fetched successfully',
            data: {
                task
            }
        });
    } catch (error) {
        console.log("Single Task error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the task"
        });
    }
}

const updateTask = async (req, res) => {
    const { title, description, comment, status, categoryId, projectId, startTime, endTime, breakTime, userId} = req.body;
    
    try {
        const { error } = taskSchema.validate({ 
            title, description, categoryId, projectId, startTime, 
            endTime, breakTime, comment, userId, status, 
        });
        
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return res.status(400).json({ error: 'Invalid user ID format' });
        }
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID format' });
        }
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: 'Invalid category ID format' });
        }
        const checkProject = await Project.findById(projectId)
        if(!checkProject){
            return res.status(404).json({success:false, error: "Invalid  project Id"})
        }
        const checkCategory = await Category.findById(projectId)
        if(!checkCategory){
            return res.status(404).json({success:false, error: "Invalid  project Id"})
        }
        const loginUser = await Auth.findById(userId)
        if(!loginUser){
            return res.status(404).json({success:false, error: "Invalid login user"})
        }
        
        // Calculate duration if endTime is provided
        let duration;
        if (endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            // Duration in milliseconds minus break time (converted to milliseconds)
            duration = (end - start) - (breakTime * 60 * 1000);
            
            // Ensure duration is not negative
            if (duration < 0) {
                return res.status(400).json({ error: 'End time must be after start time, accounting for breaks' });
            }
            
            // Convert to minutes
            duration = Math.floor(duration / (60 * 1000));
        }
        
        // Set status to completed if endTime is provided
        const updatedStatus = endTime ? 'Completed' : (status || 'In Progress');
        
        const task = await Task.findOneAndUpdate(
            { 
                _id: req.params.id,
                user: req.user.userId
            }, 
            {
                title,
                description,
                comment,
                categroy: categoryId,
                project: projectId,
                startTime,
                endTime,
                breakTime,
                duration,
                status: updatedStatus,
            }, 
            {
                new: true,
                runValidators: true
            }
        );
        
        if (!task) {
            return res.status(404).json({
                status: 'false',
                error: "Task not found or you don't have permission to update it"
            });
        }
        
        res.status(200).json({
            status: 'true',
            message: "Task updated successfully",
            data: {
                task
            }
        });
    } catch (error) {
        console.log("Update Task error", error);
        res.status(404).json({
            status: 'false',
            error: "Error updating the task"
        });
    }
}

const deleteTask = async (req, res) => {
    try {
        const result = await Task.findOneAndDelete({ 
            _id: req.params.id,
            user: req.user.userId
        });

        if (!result) {
            return res.status(404).json({
                status: 'false',
                error: "Task not found or you don't have permission to delete it"
            });
        }
        
        res.status(204).json({
            status: 'true', 
            message: "Task deleted successfully",
            data: null
        });
    } catch (error) {
        console.log("Delete Task error", error);
        res.status(404).json({
            status: 'false',
            error: "Error deleting the task"
        });
    }
}

const completeTask = async (req, res) => {
    const { endTime, breakTime } = req.body;
    
    try {
        if (!endTime) {
            return res.status(400).json({ error: 'End time is required to complete an task' });
        }
        
        const task = await Task.findOne({ 
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!task) {
            return res.status(404).json({
                status: 'false',
                error: "Task not found or you don't have permission to update it"
            });
        }
        
        const start = new Date(task.startTime);
        const end = new Date(endTime);
        const breakDuration = breakTime || task.breakTime || 0;
        
        // Duration in milliseconds minus break time (converted to milliseconds)
        const duration = (end - start) - (breakDuration * 60 * 1000);
        
        // Ensure duration is not negative
        if (duration < 0) {
            return res.status(400).json({ error: 'End time must be after start time, accounting for breaks' });
        }
        
        // Convert to minutes
        const durationInMinutes = Math.floor(duration / (60 * 1000));
        
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            {
                endTime,
                breakTime: breakDuration,
                duration: durationInMinutes,
                status: 'Completed',
            }, 
            {
                new: true,
                runValidators: true
            }
        );
        
        res.status(200).json({
            status: 'true',
            message: "Task completed successfully",
            data: {
                task: updatedTask
            }
        });
    } catch (error) {
        console.log("Complete Task error", error);
        res.status(400).json({
            status: 'false',
            error: "Error completing the task"
        });
    }
}

const getTaskStats = async (req, res) => {
    try {
        // Get tasks for the logged-in user
        const tasks = await Task.find({ 
            user: req.user._id,
            status: 'Completed' // Only include completed tasks for stats
        });
        
        // Calculate total time spent
        const totalDuration = tasks.reduce((total, task) => {
            return total + (task.duration || 0);
        }, 0);
        
        // Calculate time spent by category
        const categoryStats = await Task.aggregate([
            { $match: { user: req.user._id, status: 'Completed' } },
            { $group: { _id: '$categoryId', totalDuration: { $sum: '$duration' } } },
            { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
            { $unwind: '$category' },
            { $project: { category: '$category.title', totalDuration: 1 } }
        ]);
        
        // Calculate time spent by project
        const projectStats = await Task.aggregate([
            { $match: { user: req.user._id, status: 'Completed' } },
            { $group: { _id: '$projectId', totalDuration: { $sum: '$duration' } } },
            { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
            { $unwind: '$project' },
            { $project: { project: '$project.title', totalDuration: 1 } }
        ]);
        
        res.status(200).json({
            status: 'true',
            message: 'Task statistics fetched successfully',
            data: {
                totalTasks: tasks.length,
                totalDuration,
                categoryStats,
                projectStats
            }
        });
    } catch (error) {
        console.log("Task Stats error", error);
        res.status(400).json({
            status: 'false',
            error: "Error fetching task statistics"
        });
    }
}

export { 
    allTasks, 
    addTask, 
    singleTask, 
    updateTask, 
    deleteTask,
    searchTasks,
};