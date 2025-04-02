import express from 'express';

import { 
    allActivities, 
    createActivity, 
    singleActivity, 
    updateActivity, 
    deleteActivity,

} from '../controllers/activityController.js'

const router = express.Router();

router.get('/all-activities', allActivities);

router.post('/add-activity', createActivity);

router.get('/single-activity/:id', singleActivity);

router.put('/update-activity/:id', updateActivity);

router.delete('/delete-activity/:id', deleteActivity);

export default router;