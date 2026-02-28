import { Router } from 'express';
import { getUsers, deleteUser, getLogs, getTokens, createToken, revokeToken } from '../controllers/securityController';

const router = Router();

// User management
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

// Audit logs
router.get('/logs', getLogs);

// Edge API tokens
router.get('/tokens', getTokens);
router.post('/tokens', createToken);
router.delete('/tokens/:id', revokeToken);

export default router;
