import express from 'express';
import { allCategories, createCategory, singleCategory, updateCategory, deleteCategory } 
        from '../controllers/categoryController.js';
import {isAuthenticated} from '../middlewares/authenticateUser.js';

const router = express.Router();

router.get('/all-categories', allCategories);

router.post('/add-category', createCategory);

router.get('/single-category/:id', singleCategory);

router.put('/edit-category/:id', updateCategory);

router.delete('/delete-category/:id', deleteCategory);

export default router;
