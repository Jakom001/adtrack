import {Activity, Category} from "../models/activityModel";

const allActivities = async (req, res) => {
    try {
        const activities = await Activity.find();
        res.status(200).json({
            status: 'success',
            message: "Activity fetched successfully",
            length: activities.length,
            data: {
                activities
            }
        });
    } catch (error) {
        console.log("All Activities error", error);
        res.status(404).json({
            status: 'fail',
            error: "Error getting the activities"
        });
    }
}

const getSingleActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        
        res.status(200).json({
            status: 'success',
            data: {
                activity
            }
        });
    } catch (error) {
        console.log("Single Activity error", error);
        res.status(404).json({
            status: 'fail',
            error: "Error getting the activity"
        });
    }
}

const createActivity = async (req, res) => {
    try {
        const newActivity = await Activity.create(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Activity created successfully',
            data: {
                activity: newActivity
            }
        });
    } catch (error) {
        console.log("Create Activity error", error);
        res.status(400).json({
            status: 'fail',
            error: "Error creating the activity"
        });
    }
}

const updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(req.params
            .id, req.body, {
                new: true,
                runValidators: true
            });
        res.status(200).json({
            status: 'success',
            message: 'Activity updated successfully',
            data: {
                activity
            }
        });
    }
    catch (error) {
        console.log("Update Activity error", error);
        res.status(404).json({
            status: 'fail',
            error: "Error updating the activity"
        });
    }
}

const deleteActivity = async (req, res) => {
    try {
        await Activity.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        console.log("Delete Activity error", error);
        res.status(404).json({
            status: 'fail',
            error: "Error deleting the activity"
        });
    }
}


export { allActivities, getSingleActivity, createActivity, updateActivity, deleteActivity };