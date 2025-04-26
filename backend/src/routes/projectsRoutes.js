import express from 'express';
import { allProjects, addProject, singleProject, updateProject, searchProjects, deleteProject } 
        from '../controllers/projectController.js';

const router = express.Router();

router.get('/all-projects',  allProjects);

router.post('/add-project',  addProject);

router.get('/single-project/:id',  singleProject);

router.put('/update-project/:id',  updateProject);

router.delete('/delete-project/:id',  deleteProject);
router.get('/search', searchProjects);

export default router;
