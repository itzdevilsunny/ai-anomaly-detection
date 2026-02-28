import { Request, Response } from 'express';

// ─── Types ──────────────────────────────────────────────────

export interface SystemSettings {
    systemName: string;
    aiConfidenceThreshold: number;
    activeModel: 'yolov8n-general' | 'yolov8m-municipal-parking' | 'yolov8s-campus-attendance';
    enableEmailAlerts: boolean;
    enablePushNotifications: boolean;
    autoAcknowledgeLowSeverity: boolean;
}

// ─── In-Memory Store ────────────────────────────────────────

let settings: SystemSettings = {
    systemName: 'VisionAIoT Campus Alpha',
    aiConfidenceThreshold: 72,
    activeModel: 'yolov8m-municipal-parking',
    enableEmailAlerts: true,
    enablePushNotifications: false,
    autoAcknowledgeLowSeverity: true,
};

// ─── Handlers ───────────────────────────────────────────────

/** GET /api/settings */
export const getSettings = (_req: Request, res: Response): void => {
    res.json(settings);
};

/** PUT /api/settings */
export const updateSettings = (req: Request, res: Response): void => {
    const body = req.body as Partial<SystemSettings>;

    // Server-side validation
    if (body.systemName !== undefined && body.systemName.length < 3) {
        res.status(400).json({ error: 'System name must be at least 3 characters' });
        return;
    }
    if (body.aiConfidenceThreshold !== undefined && (body.aiConfidenceThreshold < 10 || body.aiConfidenceThreshold > 99)) {
        res.status(400).json({ error: 'Confidence threshold must be between 10 and 99' });
        return;
    }

    settings = { ...settings, ...body };
    res.json(settings);
};
