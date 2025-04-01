import express from 'express';
import { allProjects, createProject, singleProject, updateProject, deleteProject } 
        from '../controllers/projectController.js';
import {isAuthenticated} from '../middlewares/authenticateUser.js';

const router = express.Router();

router.get('/all-projects', allProjects);

router.post('/add-project', createProject);

router.get('/single-project/:id', singleProject);

router.put('/edit-project/:id', updateProject);

router.delete('/delete-project/:id', deleteProject);

export default router;
