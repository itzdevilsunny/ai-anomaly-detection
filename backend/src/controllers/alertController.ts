import { Request, Response } from 'express';

export type AlertStatus = 'Pending' | 'Investigating' | 'Resolved' | 'False Positive';

export interface AnomalyAlert {
    id: string;
    camera_id: string;
    type: 'PARKING_VIOLATION' | 'CAPACITY_EXCEEDED' | 'UNAUTHORIZED_VEHICLE' | 'SUSPICIOUS_BEHAVIOR';
    severity: 'Low' | 'Medium' | 'Critical';
    confidence: number;
    image_url: string;
    status: AlertStatus;
    timestamp: string;
    operator_notes?: string;
}

// In-memory alert store (stands in for PostgreSQL when DB is unavailable)
export const alertStore = new Map<string, AnomalyAlert>();

/** GET /api/alerts — return all alerts, newest first */
export const getAlerts = (_req: Request, res: Response): void => {
    const alerts = Array.from(alertStore.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    res.json(alerts);
};

/** PUT /api/alerts/:id — update status & operator_notes */
export const updateAlert = (req: Request, res: Response): void => {
    const id = req.params.id as string;
    const { status, notes } = req.body as { status?: AlertStatus; notes?: string };

    const alert = alertStore.get(id);

    if (!alert) {
        res.status(404).json({ error: 'Alert not found' });
        return;
    }

    if (status) alert.status = status;
    if (notes !== undefined) alert.operator_notes = notes;

    alertStore.set(id, alert);

    console.log(`[Alert Updated] ${id} → ${status}`);
    res.json(alert);
};
