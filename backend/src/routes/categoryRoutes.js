import express from 'express';
import { allCategories, addCategory, singleCategory, updateCategory, searchCategories, deleteCategory } 
        from '../controllers/categoryController.js';

const router = express.Router();

router.get('/all-categories',  allCategories);

router.post('/add-category',  addCategory);

router.get('/single-category/:id',  singleCategory);

router.put('/update-category/:id',  updateCategory);

router.delete('/delete-category/:id',  deleteCategory);
router.get('/search', searchCategories);

export default router;
