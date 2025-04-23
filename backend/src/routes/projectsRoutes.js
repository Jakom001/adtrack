import express from 'express';
import { allProjects, addProject, singleProject, updateProject, deleteProject } 
        from '../controllers/projectController.js';

const router = express.Router();

router.get('/all-projects', allProjects);

router.post('/add-project', addProject);

router.get('/single-project/:id', singleProject);

router.put('/update-project/:id', updateProject);

router.delete('/delete-project/:id', deleteProject);

export default router;
