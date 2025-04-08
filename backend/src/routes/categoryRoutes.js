import express from 'express';
import { allCategories, createCategory, singleCategory, updateCategory, deleteCategory } 
        from '../controllers/categoryController.js';

import csrf from 'csurf';
const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get('/all-categories',  allCategories);

router.post('/add-category', csrfProtection, createCategory);

router.get('/single-category/:id',  singleCategory);

router.put('/edit-category/:id', csrfProtection, updateCategory);

router.delete('/delete-category/:id', csrfProtection, deleteCategory);

export default router;
