import express from 'express';
import { 
  getMunicipalityStats, 
  getHeatmapData, 
  getIllegalDumpReports, 
  createIllegalDumpReport, 
  updateDumpReportStatus, 
  getRecyclingTraceability 
} from '../controllers/municipalityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public / Semi-public routes
router.get('/traceability', getRecyclingTraceability);

// Protected routes
router.use(protect);

// Citizen reporting
router.post('/report-dump', createIllegalDumpReport);
router.get('/dump-reports', getIllegalDumpReports);

// Municipality / Admin operations
router.get('/stats', authorize('municipality', 'admin'), getMunicipalityStats);
router.get('/heatmap-data', authorize('municipality', 'admin', 'user'), getHeatmapData);
router.patch('/dump-reports/:id', authorize('municipality', 'admin'), updateDumpReportStatus);

export default router;
