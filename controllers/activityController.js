import Activity from "../models/activityModel";

const allActivities = async (req, res) => {
    try {
        const activities = await Activity.find();
        res.status(200).json({
            status: 'success',
            results: activities.length,
            data: {
                activities
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
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
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }
}

const createActivity = async (req, res) => {
    try {
        const newActivity = await Activity.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                activity: newActivity
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
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
            data: {
                activity
            }
        });
    }
    catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
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
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }
}

export { allActivities, getSingleActivity, createActivity, updateActivity, deleteActivity };