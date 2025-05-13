import express from 'express';
import { allFeatures, addFeature, singleFeature, updateFeature, searchFeatures, deleteFeature } 
        from '../controllers/featureController.js';

const router = express.Router();

router.get('/all-features',  allFeatures);

router.post('/add-feature',  addFeature);

router.get('/single-feature/:id',  singleFeature);

router.put('/update-feature/:id',  updateFeature);

router.delete('/delete-feature/:id',  deleteFeature);
router.get('/search', searchFeatures);

export default router;
