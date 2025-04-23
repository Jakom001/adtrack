import Project from '../models/projectModel.js';
import { projectSchema } from '../middlewares/validator.js';

const allProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({createdAt:-1}).populate({
            path: 'user',
            select: 'firstName'
        });
        res.status(200).json({
            status: 'true',
            length: projects.length,
            message: 'Projects fetched successfully',
            data: {
                projects
            }
        });
    } catch (error) {
        console.log("All Projects error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the projects"
        });
    }
}

const addProject = async (req, res) => {
    const {title, description} = req.body

    try {
        const { error } = projectSchema.validate({title, description});
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (await Project.findOne({title })) {
            return res.status(400).json({ error: 'Project title already exists' });
        }
        const newProject = await Project.create({title, description, user: req.user._id});
        res.status(201).json({
            status: 'true', 
            message: 'Project created successfully',
            data: {
                project: newProject
            }
        });
    } catch (error) {
        console.log("Create Project error", error);
        res.status(400).json({
            status: 'false',
            message: "Error creating the project"
        });
    }
}

const singleProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                status: 'false',
                error: "Project not found"
            });
        }
        res.status(200).json({
            status: 'true',
            message: 'Project fetched successfully',
            data: {
                project
            }
        });
    } catch (error) {
        console.log("Single Project error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the project"
        });
    }
}

const updateProject = async (req, res) => {
    const { title, description } = req.body;
    try {
        const { error } = projectSchema.validate({ title, description });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const project = await Project.findByIdAndUpdate(req.params
            .id, {title, description, user: req.user._id}, {
                new: true,
                runValidators: true
            });
        
            if (!project) {
            return res.status(404).json({
                status: 'false',
                error: "Project not found"
            });
        }
        res.status(200).json({
            status: 'true', 
            message: "Project updated successfully",
            data: {
                project
            }
        });
    }
    catch (error) {
        console.log("Update Project error", error);
        res.status(404).json({
            status: 'false',
            error: "Error updating the project"
        });
    }
}

const deleteProject = async (req, res) => {
    try {
        const result = await Project.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                status: 'false',
                error: "Project not found"
            });
        }
        res.status(204).json({
            status: 'true', message: "Project deleted successfully",
            data: null
        });
    } catch (error) {
        console.log("Delete Project erro", error);
        res.status(404).json({
            status: 'false',
            error: "Error deleting the project"
        });
    }
}

export { allProjects, addProject, singleProject, updateProject, deleteProject };