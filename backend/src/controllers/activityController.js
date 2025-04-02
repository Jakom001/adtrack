import Activity from '../models/activityModel.js';
import { activitySchema } from '../middlewares/validator.js';

const allActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.user._id })
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
            length: activities.length,
            message: 'Activities fetched successfully',
            data: {
                activities
            }
        });
    } catch (error) {
        console.log("All Activities error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the activities"
        });
    }
}

const createActivity = async (req, res) => {
    const { title, description, comment, categoryId, projectId, startTime, endTime, breakTime, priority} = req.body;
    
    try {
        const { error } = activitySchema.validate({ 
            title, description, categoryId, projectId, startTime, 
            endTime, breakTime, priority, comment 
        });
        
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
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
            
            // Convert to minutes
            duration = Math.floor(duration / (60 * 1000));
        }
        
        // Set status based on endTime
        const status = endTime ? 'Completed' : 'In Progress';
        
        const newActivity = await Activity.create({
            title,
            description,
            comment,
            categoryId,
            projectId,
            startTime,
            endTime,
            breakTime,
            duration,
            status,
            priority,
            user: req.user._id
        });
        
        res.status(201).json({
            status: 'true',
            message: 'Activity created successfully',
            data: {
                activity: newActivity
            }
        });
    } catch (error) {
        console.log("Create Activity error", error);
        res.status(400).json({
            status: 'false',
            message: "Error creating the activity"
        });
    }
}

const singleActivity = async (req, res) => {
    try {
        const activity = await Activity.findOne({ 
            _id: req.params.id,
            user: req.user._id
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
        
        if (!activity) {
            return res.status(404).json({
                status: 'false',
                error: "Activity not found"
            });
        }
        
        res.status(200).json({
            status: 'true',
            message: 'Activity fetched successfully',
            data: {
                activity
            }
        });
    } catch (error) {
        console.log("Single Activity error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the activity"
        });
    }
}

const updateActivity = async (req, res) => {
    const { title, description, comment, categoryId, projectId, startTime, endTime, breakTime, status, priority } = req.body;
    
    try {
        const { error } = activitySchema.validate({ 
            title, description, categoryId, projectId, startTime, 
            endTime, breakTime, status, priority, comment 
        });
        
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
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
        
        const activity = await Activity.findOneAndUpdate(
            { 
                _id: req.params.id,
                user: req.user._id
            }, 
            {
                title,
                description,
                comment,
                categoryId,
                projectId,
                startTime,
                endTime,
                breakTime,
                duration,
                status: updatedStatus,
                priority,
            }, 
            {
                new: true,
                runValidators: true
            }
        );
        
        if (!activity) {
            return res.status(404).json({
                status: 'false',
                error: "Activity not found or you don't have permission to update it"
            });
        }
        
        res.status(200).json({
            status: 'true',
            message: "Activity updated successfully",
            data: {
                activity
            }
        });
    } catch (error) {
        console.log("Update Activity error", error);
        res.status(404).json({
            status: 'false',
            error: "Error updating the activity"
        });
    }
}

const deleteActivity = async (req, res) => {
    try {
        const result = await Activity.findOneAndDelete({ 
            _id: req.params.id,
            user: req.user._id
        });

        if (!result) {
            return res.status(404).json({
                status: 'false',
                error: "Activity not found or you don't have permission to delete it"
            });
        }
        
        res.status(204).json({
            status: 'true', 
            message: "Activity deleted successfully",
            data: null
        });
    } catch (error) {
        console.log("Delete Activity error", error);
        res.status(404).json({
            status: 'false',
            error: "Error deleting the activity"
        });
    }
}


const completeActivity = async (req, res) => {
    const { endTime, breakTime } = req.body;
    
    try {
        if (!endTime) {
            return res.status(400).json({ error: 'End time is required to complete an activity' });
        }
        
        const activity = await Activity.findOne({ 
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!activity) {
            return res.status(404).json({
                status: 'false',
                error: "Activity not found or you don't have permission to update it"
            });
        }
        
        const start = new Date(activity.startTime);
        const end = new Date(endTime);
        const breakDuration = breakTime || activity.breakTime || 0;
        
        // Duration in milliseconds minus break time (converted to milliseconds)
        const duration = (end - start) - (breakDuration * 60 * 1000);
        
        // Ensure duration is not negative
        if (duration < 0) {
            return res.status(400).json({ error: 'End time must be after start time, accounting for breaks' });
        }
        
        // Convert to minutes
        const durationInMinutes = Math.floor(duration / (60 * 1000));
        
        const updatedActivity = await Activity.findByIdAndUpdate(
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
            message: "Activity completed successfully",
            data: {
                activity: updatedActivity
            }
        });
    } catch (error) {
        console.log("Complete Activity error", error);
        res.status(400).json({
            status: 'false',
            error: "Error completing the activity"
        });
    }
}

const getActivityStats = async (req, res) => {
    try {
        // Get activities for the logged-in user
        const activities = await Activity.find({ 
            user: req.user._id,
            status: 'Completed' // Only include completed activities for stats
        });
        
        // Calculate total time spent
        const totalDuration = activities.reduce((total, activity) => {
            return total + (activity.duration || 0);
        }, 0);
        
        // Calculate time spent by category
        const categoryStats = await Activity.aggregate([
            { $match: { user: req.user._id, status: 'Completed' } },
            { $group: { _id: '$categoryId', totalDuration: { $sum: '$duration' } } },
            { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
            { $unwind: '$category' },
            { $project: { category: '$category.title', totalDuration: 1 } }
        ]);
        
        // Calculate time spent by project
        const projectStats = await Activity.aggregate([
            { $match: { user: req.user._id, status: 'Completed' } },
            { $group: { _id: '$projectId', totalDuration: { $sum: '$duration' } } },
            { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
            { $unwind: '$project' },
            { $project: { project: '$project.title', totalDuration: 1 } }
        ]);
        
        res.status(200).json({
            status: 'true',
            message: 'Activity statistics fetched successfully',
            data: {
                totalActivities: activities.length,
                totalDuration,
                categoryStats,
                projectStats
            }
        });
    } catch (error) {
        console.log("Activity Stats error", error);
        res.status(400).json({
            status: 'false',
            error: "Error fetching activity statistics"
        });
    }
}

export { 
    allActivities, 
    createActivity, 
    singleActivity, 
    updateActivity, 
    deleteActivity,
    completeActivity,
    getActivityStats
};