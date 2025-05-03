import Project from '../models/projectModel.js';
import { projectSchema } from '../middlewares/validator.js';
import Auth from '../models/authModel.js'
import Category from '../models/categoryModel.js';
import mongoose from 'mongoose'
const allProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({createdAt:-1}).populate(
            {
            path: 'category',
            select: 'title'
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

const searchProjects = async (req, res) => {
    try {
      const searchTerm = req.query.q;
      
      if (!searchTerm) {
        return res.status(400).json({
          status: 'false',
          error: 'Search query is required'
        });
      }
  
      // Create a regex for case-insensitive search
      const searchRegex = new RegExp(searchTerm, 'i');
      
      // Search in both title and description
      const projects = await Project.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      }).sort({ createdAt: -1 }).populate({
        path: 'user',
        select: 'firstName'
      });
      
      res.status(200).json({
        status: 'true',
        length: projects.length,
        message: 'Projects search completed',
        data: projects
      });
    } catch (error) {
      console.log("Search Projects error", error);
      res.status(500).json({
        status: 'false',
        error: "Error searching for projects"
      });
    }
  };


const addProject = async (req, res) => {
    const {title, description, userId, categoryId} = req.body
    try {
        const { error } = projectSchema.validate({title, description, categoryId, userId});
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ error: 'Invalid project ID format' });
        }

        if (await Project.findOne({title })) {
            return res.status(400).json({ error: 'Project title already exists' });
        }
        
        const checkCategory = await Category.findById(catgoryId);

        if (!checkCategory){
            return res.status(404).json({success:false, error: "invalid category Id"})
        }
        const loginUser = await Auth.findById(userId)

        if(!loginUser){
            return res.status(404).json({success:false, error: "Invalid login user"})
        }
        const newProject = await Project.create({title, description, project:projectId, user:userId});
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
            error: "Error creating the project"
        });
    }
}

const singleProject = async (req, res) => {
    try {
        const id  = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid  ID format' });
        }
        const project = await Project.findById(id);
        
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
    const { title, description, userId } = req.body;
    try {
        const { error } = projectSchema.validate({ title, description, userId});
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const loginUser = await Auth.findById(userId)
        if(!loginUser){
            return res.status(404).json({success:false, error: "Invalid login user"})
        }
        const project = await Project.findByIdAndUpdate(req.params
            .id, {title, description, user: userId}, {
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
export { allProjects, addProject, singleProject, updateProject, searchProjects, deleteProject };