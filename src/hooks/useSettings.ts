import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Strict Zod validation schema
export const settingsSchema = z.object({
    systemName: z.string().min(3, 'System name must be at least 3 characters.'),
    aiConfidenceThreshold: z.number().min(10, 'Min 10%').max(99, 'Max 99%'),
    activeModel: z.enum(['yolov8n-general', 'yolov8m-municipal-parking', 'yolov8s-campus-attendance']),
    enableEmailAlerts: z.boolean(),
    enablePushNotifications: z.boolean(),
    autoAcknowledgeLowSeverity: z.boolean(),
});

export type SystemSettings = z.infer<typeof settingsSchema>;

/** Fetch current live settings */
export const useGetSettings = () =>
    useQuery<SystemSettings>({
        queryKey: ['system_settings'],
        queryFn: async () => (await axios.get(`${API_BASE}/api/settings`)).data,
        refetchOnWindowFocus: false,
    });

/** Persist updated settings */
export const useUpdateSettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (newSettings: SystemSettings) =>
            axios.put(`${API_BASE}/api/settings`, newSettings),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['system_settings'] }),
    });
};
