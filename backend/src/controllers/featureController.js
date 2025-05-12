import Feature from "../models/featureModel";
import Feature from "../models/featureModel";
import Auth from "../models/authModel";
import mongoose from "mongoose";


import { featureSchema } from "../middlewares/validator";
const allfeatures = async (req, res) =>{
    try{
        const features = await Feature.find().sort({createdAt:-1})

        res.status(200).json({
            length: features.length,
            success: true,
            message: "Features fetched successfully",
            data: {
                features
            }

        })
    }catch (error) {
        console.log("Features errors", error)
        res.status(404).json({
            error: "Error occurred while fetching users",
            success: false
        })
    }

}

const getSingleFeature = async (req, res) =>{
    try{
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ error: 'Invalid  ID format' });
        }

        const feature = await Feature.findById(id)

        if (!feature){
            return res.status(404).json({
                success: false,
                error: "Feature not found"
            })
        }
        res.status(200).json({
            status:true,
            message: "Feature fetched successfully",
            data: {
                feature
            }
        });
    }catch (error){
        console.log("Single Feature Error", error)
        res.status(404).json({
            success:false,
            error: "Error fetching the feature"
        })
    }
}

const searchFeatures = async (req, res) =>{
    try {
        const searchTerm = req.query.q

        if (!searchTerm){
            return res.status(400).json({
                success:false,
                error: "Search query is required"
            })
        }

        const searchRegex = new RegExp(searchTerm, 'i');

        const features = await Feature.find({
            $or: [
                {name: searchRegex},
                {description: searchRegex}
            ]
        }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            length: features.length,
            message: "Features Search Completed",
            data: {
                features
            }
        })
    }catch (error){
        console.log("Search Featured error", error);
      res.status(500).json({
        status: 'false',
        error: "Error searching for features"
      });
    }
}

const addFeature = async (req, res) =>{
    try{
        const {name, type, priority, image, description, userId} = req.body

        const {error} = featureSchema.validate({name, type, priority, image, description, userId})
        
        if (error){
            return res.status(400).json({
                success:false,
                error: error.details[0].message
            })
        }

        // ID validations
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        const loginUser = await Auth.findById(userId)
        if(!loginUser) {
            return res.status(404).json({success: false, error: "Invalid login user"})
        }

        const newFeature = await Feature.create({name, type, priority, image, description, user:userId})
        res.status(201).json({
            status: 'true', 
            message: 'Feature created successfully',
            data: {
                project: newProject
            }
        });
    }catch (error) {
        console.log("Create Feature error", error);
        res.status(400).json({
            status: 'false',
            error: "Error creating the Feature"
        });
    }
}