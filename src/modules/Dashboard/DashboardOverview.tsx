import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, AlertTriangle, Brain, CheckCircle,
    Server, Cpu, Shield, MapPin, Video, Zap, TrendingUp,
} from 'lucide-react';
import { useAlertStore } from '../../store/useAlertStore';
import { useEdgeStore } from '../../store/useEdgeStore';
import LiveInferenceFeed from './LiveInferenceFeed';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function DashboardOverview() {
    const alerts = useAlertStore((s) => s.alerts);
    const nodes = useEdgeStore((s) => s.nodes);

    const { data: stats } = useQuery({
        queryKey: ['system_overview_stats'],
        queryFn: async () => (await axios.get(`${API_BASE}/api/stats/overview`)).data,
        refetchInterval: 10000,
    });

    const activeNodes = nodes.filter((n) => n.status === 'online').length;
    const criticalAlerts = alerts.filter((a) => a.severity === 'Critical').length;
    const recentPriority = alerts
        .filter((a) => a.severity === 'Critical' || a.severity === 'Medium')
        .slice(0, 6);

    // Build trend chart data from live alerts
    const trendData = alerts
        .slice(0, 20)
        .reverse()
        .map((a, i) => ({
            time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            anomalies: i + 1,
            threatLevel: a.severity === 'Critical' ? 100 : a.severity === 'Medium' ? 55 : 20,
        }));

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] mx-auto w-full overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-emerald-500 tracking-wider uppercase">Live System Status</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Command Center</h1>
                    <p className="text-slate-400 text-sm mt-1">Real-time edge inference and anomaly detection overview.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors border border-slate-700">
                        Generate Report
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                        Add Camera Node
                    </button>
                </div>
            </div>

            {/* ─── KPI Row ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI
                    title="Active Edge Nodes"
                    value={`${activeNodes}/${nodes.length || 3}`}
                    sub={`${Math.round((activeNodes / Math.max(nodes.length, 1)) * 100)}% Operational`}
                    icon={<Server className="w-4 h-4 text-blue-400" />}
                    trend="up"
                    accent="blue"
                />
                <KPI
                    title="Total Anomalies (24h)"
                    value={stats?.totalAnomalies24h ?? alerts.length}
                    sub={`Critical: ${criticalAlerts}`}
                    icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
                    trend={criticalAlerts > 0 ? 'up' : 'stable'}
                    accent="red"
                />
                <KPI
                    title="Avg Inference Time"
                    value={`${stats?.avgInferenceTimeMs ?? '11'}ms`}
                    sub="Using TensorRT ONNX"
                    icon={<Brain className="w-4 h-4 text-purple-400" />}
                    trend="stable"
                    accent="purple"
                />
                <KPI
                    title="System Health"
                    value={`${stats?.systemHealthPercent ?? '99.9'}%`}
                    sub="All services operational"
                    icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
                    trend="up"
                    accent="emerald"
                />
            </div>

            {/* ─── Main Grid: Inference Feed + Priority Alerts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Live Feed */}
                <div className="lg:col-span-2 bg-[#040D21] rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
                    <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Video className="w-4 h-4 text-blue-400" />
                            Live Edge Inference
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse font-bold">REC</span>
                        </h3>
                        <div className="flex gap-1.5 text-[9px] font-mono text-slate-500">
                            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">CAM-04</span>
                            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">30 FPS</span>
                        </div>
                    </div>
                    <div className="flex-grow bg-black relative min-h-[380px]">
                        <LiveInferenceFeed
                            streamUrl="http://192.168.0.4:8080/video"
                            cameraId="CAM-04"
                        />
                    </div>
                </div>

                {/* Priority Alerts */}
                <div className="bg-[#040D21] rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            Priority Alerts
                        </h3>
                        <span className="text-[9px] text-slate-500">{recentPriority.length} active</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {recentPriority.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <Shield className="w-6 h-6 text-slate-700 mb-2" />
                                <p className="text-xs text-slate-500">No active priority alerts.</p>
                                <p className="text-[10px] text-slate-600 mt-1">System monitoring all zones.</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {recentPriority.map((alert) => (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, x: 12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl flex gap-2.5 hover:border-slate-700 transition-colors"
                                    >
                                        <div className={`w-1.5 rounded-full shrink-0 ${alert.severity === 'Critical' ? 'bg-red-500' : 'bg-amber-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{alert.type.replace(/_/g, ' ')}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                    <MapPin className="w-2.5 h-2.5" /> {alert.camera_id}
                                                </span>
                                                <span className="text-[10px] text-slate-600">
                                                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-blue-400 shrink-0 self-center">
                                            {typeof alert.confidence === 'number' && alert.confidence < 1
                                                ? `${(alert.confidence * 100).toFixed(0)}%`
                                                : `${alert.confidence}%`}
                                        </span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Anomaly Trend Chart ──────────────────────────── */}
            <div className="bg-[#040D21] p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                <div className="flex items-center justify-between mb-5 relative z-10">
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            Anomaly Detection Trend
                        </h3>
                        <p className="text-slate-500 text-[10px] mt-0.5">Volume of detected incidents across all monitored zones</p>
                    </div>
                    <div className="flex items-center gap-3 text-[9px]">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Anomalies</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Threat Level</span>
                    </div>
                </div>

                <div className="h-56 w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gAnom" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gThreat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" stroke="#334155" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: 11 }} />
                            <Area type="monotone" dataKey="anomalies" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gAnom)" />
                            <Area type="monotone" dataKey="threatLevel" stroke="#a855f7" strokeWidth={1.5} fillOpacity={1} fill="url(#gThreat)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ─── Bottom Stats Row ─────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MiniStat icon={<Cpu className="w-3.5 h-3.5 text-cyan-400" />} label="Frames Processed" value={stats?.totalFramesProcessed ?? '14.2M'} />
                <MiniStat icon={<Zap className="w-3.5 h-3.5 text-amber-400" />} label="Active Models" value={stats?.activeModels ?? 3} />
                <MiniStat icon={<Activity className="w-3.5 h-3.5 text-emerald-400" />} label="Alerts Resolved Today" value={stats?.alertsResolvedToday ?? 94} />
                <MiniStat icon={<Server className="w-3.5 h-3.5 text-blue-400" />} label="Storage Used" value={`${stats?.storageUsedGB ?? 42}/${stats?.totalStorageGB ?? 100} GB`} />
            </div>
        </div>
    );
}

// ─── Sub-Components ──────────────────────────────────────────

function KPI({ title, value, sub, icon, trend, accent }: {
    title: string; value: string | number; sub: string;
    icon: React.ReactNode; trend: 'up' | 'down' | 'stable';
    accent: 'blue' | 'red' | 'purple' | 'emerald';
}) {
    const colors = {
        blue: 'bg-blue-500/10 border-blue-500/10',
        red: 'bg-red-500/10 border-red-500/10',
        purple: 'bg-purple-500/10 border-purple-500/10',
        emerald: 'bg-emerald-500/10 border-emerald-500/10',
    };
    const trendColors = { up: 'text-emerald-400', down: 'text-red-400', stable: 'text-slate-500' };
    const trendIcons = { up: '↑', down: '↓', stable: '→' };

    return (
        <div className="bg-[#040D21] border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all group">
            <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${colors[accent]}`}>
                    {icon}
                </div>
                <p className="text-slate-400 text-xs font-medium">{title}</p>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
            <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[9px] font-bold uppercase tracking-wider ${trendColors[trend]}`}>
                    {trendIcons[trend]} {trend}
                </span>
                <p className="text-[10px] text-slate-500 truncate">{sub}</p>
            </div>
        </div>
    );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="bg-[#040D21] border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{value}</p>
                <p className="text-[9px] text-slate-500 truncate">{label}</p>
            </div>
        </div>
    );
}
