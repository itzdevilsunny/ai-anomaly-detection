import { Router } from 'express';
import { getAlerts, updateAlert } from '../controllers/alertController';

const router = Router();

router.get('/', getAlerts);
router.put('/:id', updateAlert);

export default router;
