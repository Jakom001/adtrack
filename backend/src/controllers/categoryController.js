import Category from '../models/categoryModel.js';
import { categorySchema } from '../middlewares/validator.js';

const allCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({createdAt:-1}).populate({
            path: 'user',
            select: 'firstName'
        });
        res.status(200).json({
            status: 'true',
            length: categories.length,
            message: 'Categories fetched successfully',
            data: {
                categories
            }
        });
    } catch (error) {
        console.log("All Categories error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the categories"
        });
    }
}

const createCategory = async (req, res) => {
    const {title, description} = req.body
    try {
        const { error } = categorySchema.validate({title, description});
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (await Category.findOne({title })) {
            return res.status(400).json({ error: 'Category title already exists' });
        }
        const newCategory = await Category.create({title, description, user: req.user._id});
        res.status(201).json({
            status: 'true', 
            message: 'Category created successfully',
            data: {
                category: newCategory
            }
        });
    } catch (error) {
        console.log("Create Category error", error);
        res.status(400).json({
            status: 'false',
            message: "Error creating the category"
        });
    }
}

const singleCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                status: 'false',
                error: "Category not found"
            });
        }
        res.status(200).json({
            status: 'true',
            message: 'Category fetched successfully',
            data: {
                category
            }
        });
    } catch (error) {
        console.log("Single Category error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the category"
        });
    }
}

const updateCategory = async (req, res) => {
    const { title, description } = req.body;
    try {
        const { error } = categorySchema.validate({ title, description });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const category = await Category.findByIdAndUpdate(req.params
            .id, {title, description, user: req.user._id}, {
                new: true,
                runValidators: true
            });
        
            if (!category) {
            return res.status(404).json({
                status: 'false',
                error: "Category not found"
            });
        }
        res.status(200).json({
            status: 'true', 
            message: "Category updated successfully",
            data: {
                category
            }
        });
    }
    catch (error) {
        console.log("Update Category error", error);
        res.status(404).json({
            status: 'false',
            error: "Error updating the category"
        });
    }
}

const deleteCategory = async (req, res) => {
    try {
        const result = await Category.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                status: 'false',
                error: "Category not found"
            });
        }
        res.status(204).json({
            status: 'true', message: "Category deleted successfully",
            data: null
        });
    } catch (error) {
        console.log("Delete Category erro", error);
        res.status(404).json({
            status: 'false',
            error: "Error deleting the category"
        });
    }
}

export { allCategories, createCategory, singleCategory, updateCategory, deleteCategory };