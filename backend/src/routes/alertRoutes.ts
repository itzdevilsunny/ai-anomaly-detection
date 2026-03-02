import { Router } from 'express';
import { getAlerts, updateAlert, handleAiDetection } from '../controllers/alertController';

const router = Router();

// The dedicated endpoint for your Python AI engine
router.post('/webhook', handleAiDetection);

router.get('/', getAlerts);
router.put('/:id', updateAlert);

export default router;
