import { Request, Response } from 'express';

// ─── Types ──────────────────────────────────────────────────

export type Role = 'Admin' | 'Operator' | 'Viewer';

export interface SystemUser {
    id: string;
    email: string;
    role: Role;
    created_at: string;
}

export interface AuditLogEntry {
    id: string;
    action: string;
    actor_email: string;
    ip_address: string;
    timestamp: string;
}

export interface EdgeToken {
    id: string;
    name: string;
    token_prefix: string;
    scopes: string[];
    created_at: string;
    last_used: string | null;
    status: 'active' | 'revoked';
}

// ─── In-Memory Stores ───────────────────────────────────────

export const usersStore = new Map<string, SystemUser>([
    ['usr_001', { id: 'usr_001', email: 'admin@visionaiot.dev', role: 'Admin', created_at: new Date(Date.now() - 90 * 86400000).toISOString() }],
    ['usr_002', { id: 'usr_002', email: 'operator@visionaiot.dev', role: 'Operator', created_at: new Date(Date.now() - 30 * 86400000).toISOString() }],
    ['usr_003', { id: 'usr_003', email: 'viewer@campus.edu', role: 'Viewer', created_at: new Date(Date.now() - 7 * 86400000).toISOString() }],
    ['usr_004', { id: 'usr_004', email: 'patrol.lead@security.org', role: 'Operator', created_at: new Date(Date.now() - 14 * 86400000).toISOString() }],
]);

export const auditLogs: AuditLogEntry[] = [
    { id: 'log_001', action: 'User Login (Success)', actor_email: 'admin@visionaiot.dev', ip_address: '192.168.1.10', timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: 'log_002', action: 'Alert Status Updated → Resolved', actor_email: 'operator@visionaiot.dev', ip_address: '192.168.1.25', timestamp: new Date(Date.now() - 600000).toISOString() },
    { id: 'log_003', action: 'Edge Node Restart (edge-jetson-01)', actor_email: 'admin@visionaiot.dev', ip_address: '192.168.1.10', timestamp: new Date(Date.now() - 900000).toISOString() },
    { id: 'log_004', action: 'Model Update Pushed (v8.1.2 → v8.1.3)', actor_email: 'admin@visionaiot.dev', ip_address: '10.0.0.5', timestamp: new Date(Date.now() - 1800000).toISOString() },
    { id: 'log_005', action: 'User Login (Failed — wrong password)', actor_email: 'viewer@campus.edu', ip_address: '203.112.45.89', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'log_006', action: 'New User Registered', actor_email: 'patrol.lead@security.org', ip_address: '192.168.1.35', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 'log_007', action: 'API Token Generated: jetson-fleet-key', actor_email: 'admin@visionaiot.dev', ip_address: '192.168.1.10', timestamp: new Date(Date.now() - 14400000).toISOString() },
    { id: 'log_008', action: 'Camera CAM-03 Status → Offline', actor_email: 'system', ip_address: '127.0.0.1', timestamp: new Date(Date.now() - 21600000).toISOString() },
];

export const edgeTokens = new Map<string, EdgeToken>([
    ['tok_001', { id: 'tok_001', name: 'jetson-fleet-key', token_prefix: 'viot_sk_3xF9...', scopes: ['inference:push', 'heartbeat:send'], created_at: new Date(Date.now() - 60 * 86400000).toISOString(), last_used: new Date(Date.now() - 10000).toISOString(), status: 'active' }],
    ['tok_002', { id: 'tok_002', name: 'campus-relay-key', token_prefix: 'viot_sk_8kM2...', scopes: ['inference:push'], created_at: new Date(Date.now() - 30 * 86400000).toISOString(), last_used: new Date(Date.now() - 86400000).toISOString(), status: 'active' }],
    ['tok_003', { id: 'tok_003', name: 'deprecated-v1-key', token_prefix: 'viot_sk_1aB0...', scopes: ['inference:push'], created_at: new Date(Date.now() - 180 * 86400000).toISOString(), last_used: null, status: 'revoked' }],
]);

// ─── Handlers ───────────────────────────────────────────────

/** GET /api/security/users */
export const getUsers = (_req: Request, res: Response): void => {
    res.json(Array.from(usersStore.values()));
};

/** DELETE /api/security/users/:id */
export const deleteUser = (req: Request, res: Response): void => {
    const id = req.params.id as string;
    if (!usersStore.has(id)) { res.status(404).json({ error: 'User not found' }); return; }
    usersStore.delete(id);
    auditLogs.unshift({
        id: `log_${Date.now()}`,
        action: `User Account Revoked (${id})`,
        actor_email: 'admin@visionaiot.dev',
        ip_address: req.ip || '0.0.0.0',
        timestamp: new Date().toISOString(),
    });
    res.json({ success: true });
};

/** GET /api/security/logs */
export const getLogs = (_req: Request, res: Response): void => {
    res.json(auditLogs.slice(0, 50));
};

/** GET /api/security/tokens */
export const getTokens = (_req: Request, res: Response): void => {
    res.json(Array.from(edgeTokens.values()));
};

/** POST /api/security/tokens — Generate new token */
export const createToken = (req: Request, res: Response): void => {
    const { name, scopes } = req.body as { name: string; scopes: string[] };
    const id = `tok_${Date.now()}`;
    const token: EdgeToken = {
        id,
        name: name || `key-${id}`,
        token_prefix: `viot_sk_${Math.random().toString(36).slice(2, 6)}...`,
        scopes: scopes || ['inference:push'],
        created_at: new Date().toISOString(),
        last_used: null,
        status: 'active',
    };
    edgeTokens.set(id, token);
    auditLogs.unshift({
        id: `log_${Date.now()}`,
        action: `API Token Generated: ${token.name}`,
        actor_email: 'admin@visionaiot.dev',
        ip_address: req.ip || '0.0.0.0',
        timestamp: new Date().toISOString(),
    });
    res.json(token);
};

/** DELETE /api/security/tokens/:id — Revoke token */
export const revokeToken = (req: Request, res: Response): void => {
    const id = req.params.id as string;
    const token = edgeTokens.get(id);
    if (!token) { res.status(404).json({ error: 'Token not found' }); return; }
    token.status = 'revoked';
    auditLogs.unshift({
        id: `log_${Date.now()}`,
        action: `API Token Revoked: ${token.name}`,
        actor_email: 'admin@visionaiot.dev',
        ip_address: req.ip || '0.0.0.0',
        timestamp: new Date().toISOString(),
    });
    res.json({ success: true });
};
