import Task from '../models/taskModel.js';
import Project from '../models/projectModel.js';
import { taskSchema } from '../middlewares/validator.js';
import Auth from '../models/authModel.js';
import mongoose from 'mongoose'

const allTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate(
                {
                    path: 'project',
                    select: 'title'
                }
            );
        
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

const singleTask = async (req, res) => {
    try {
        const id  = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid  ID format' });
        }
        const task = await Task.findById(
            {
                _id:id,
                user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate(
                {
                    path: 'project',
                    select: 'title'
                }

        );
        
        if (!task) {
            return res.status(404).json({
                status: 'false',
                error: "task not found"
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
        data: tasks
      });
    } catch (error) {
      console.log("Search Tasks error", error);
      res.status(500).json({
        status: 'false',
        error: "Error searching for tasks"
      });
    }
  };
        // Add Task
  const addTask = async (req, res) => {
    const { title, description, comment, projectId, startTime, endTime, breakTime, userId } = req.body;
    
    try {
        // Create a sanitized object for validation, converting empty strings to null
        const dataToValidate = {
            title, 
            description: description || null,
            comment: comment || null, 
            projectId, 
            startTime: startTime || null, 
            endTime: endTime || null, 
            breakTime: breakTime === '' ? null : Number(breakTime),
            userId
        };
        
        const { error } = taskSchema.validate(dataToValidate);
        
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        
        // ID validations
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: 'Invalid project ID format' });
        }
        
        // Entity validations
        const checkProject = await Project.findById(projectId)
        if(!checkProject) {
            return res.status(404).json({success: false, error: "Invalid project Id"})
        }
        
        
        
        const loginUser = await Auth.findById(userId)
        if(!loginUser) {
            return res.status(404).json({success: false, error: "Invalid login user"})
        }
        
        // Time and duration calculations
        let duration = null;
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            
            // Make sure dates are valid
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ error: 'Invalid date format for start or end time' });
            }
            
            // Check if end time is after start time
            if (end <= start) {
                return res.status(400).json({ error: 'End time must be after start time' });
            }
            
            // Calculate duration (in hours)
            const breakTimeMs = (breakTime ? Number(breakTime) : 0) * 60 * 1000;
            const durationMs = end.getTime() - start.getTime() - breakTimeMs;
            
            // Ensure duration is not negative after subtracting break time
            if (durationMs < 0) {
                return res.status(400).json({ error: 'Break time cannot exceed the difference between start and end time' });
            }
            
            // Convert to hours (using milliseconds to hours conversion)
            duration = Math.floor(durationMs / (60 * 60 * 1000));
        }
        
        const status = endTime ? 'Completed' : 'Pending';
        
        // Create the task
        const newTask = await Task.create({
            title,
            description: description || undefined,
            comment: comment || undefined,
            project: projectId,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            breakTime: breakTime === '' ? 0 : Number(breakTime),
            duration,
            status,
            user: userId
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
            message: "Error creating the task",
            error: error.message // Include the actual error message for debugging
        });
    }
}

const updateTask = async (req, res) => {
    const { title, description, comment,  projectId, startTime, endTime, breakTime, userId} = req.body;
    
    try {
        const { error } = taskSchema.validate({ 
            title, description, projectId, startTime, 
            endTime, breakTime, comment, userId, 
        });
        
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: 'Invalid project ID format' });
        }
        const checkProject = await Project.findById(projectId)
        if(!checkProject){
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
        
        const status = endTime ? 'Completed' : 'Pending';

        const id  = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid  ID format' });
        }
        const task = await Task.findOneAndUpdate(
            { 
                _id:id,
                user: req.user.userId
            }, 
            {
                title,
                description,
                comment,
                project: projectId,
                startTime,
                endTime,
                breakTime,
                duration,
                user: userId,
                status,
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

export { 
    allTasks, 
    addTask, 
    singleTask, 
    updateTask, 
    deleteTask,
    searchTasks,
};