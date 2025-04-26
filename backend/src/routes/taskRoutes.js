import express from 'express';

import { 
    allTasks, 
    addTask, 
    singleTask, 
    updateTask, 
    deleteTask,
} from '../controllers/taskController.js'

const router = express.Router();

router.get('/all-tasks', allTasks);

router.post('/add-task', addTask);

router.get('/single-task/:id', singleTask);

router.put('/update-task/:id', updateTask);

router.delete('/delete-task/:id', deleteTask);

export default router;