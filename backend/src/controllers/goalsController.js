import  Goal  from "../models/goalModel";

const allgoals = async (req, res, next) => {
    try {
        const goals = await Goal.find();
        res.status(200).json({
            status: 'success',
            results: goals.length,
            data: {
                goals
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }
}

const createGoal = async (req, res, next) => {
    try {
        const newGoal = await Goal.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                goal: newGoal
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        });
    }
}

const getGoalById = async (req, res, next) => {
    try {
        const goal = await Goal.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                goal
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }
}

const updateGoal = async (req, res, next) => {
    try {
        const goal = await Goal.findByIdAndUpdate(req.params.id
            , req.body, {
                new: true,
                runValidators: true
            });
        res.status(200).json({
            status: 'success',
            data: {
                goal
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

const deleteGoal = async (req, res, next) => {
    try {
        const goal = await Goal.findByIdAndDelete(req.params.id);
        if (!goal) {
            return res.status(404).json({
                status: 'fail',
                message: 'Goal not found'
            });
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error
        });
    }
}

export { allgoals, createGoal, updateGoal, deleteGoal };