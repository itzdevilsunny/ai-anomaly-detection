import { Router } from 'express';
import { getEdgeNodes, sendEdgeCommand } from '../controllers/edgeController';

const router = Router();

router.get('/', getEdgeNodes);
router.post('/:id/command', sendEdgeCommand);

export default router;
