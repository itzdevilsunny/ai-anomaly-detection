import { Router } from 'express';
import { getOverviewStats } from '../controllers/statsController';

const router = Router();

router.get('/overview', getOverviewStats);

export default router;
