import { useEffect, useState } from "react";
import { apiClient } from "@/api/clients";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
    FlaskConical, Box, Database, GitBranch,
    Cpu, Activity, TrendingUp, Clock, ArrowRight
} from "lucide-react";
import StatCard from "@/components/ui/stat-card";
import StatusBadge from "@/components/ui/status-badge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

const mockThroughput = Array.from({ length: 14 }, (_, i) => ({
    date: format(subDays(new Date(), 13 - i), "MMM d"),
    jobs: Math.floor(40 + Math.random() * 80),
    gpu_hours: Math.floor(100 + Math.random() * 200),
}));

const mockGpuUtil = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    util: Math.floor(50 + Math.random() * 45),
}));

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-xs">
            <div className="text-zinc-400 mb-1">{label}</div>
            {payload.map((p) => (
                <div key={p.dataKey} style={{ color: p.color }} className="font-medium">
                    {p.name}: {p.value}
                </div>
            ))}
        </div>
    );
}

export default function Dashboard() {
    const [experiments, setExperiments] = useState([]);
    const [models, setModels] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiClient.entities.Experiment.list("-created_date", 50),
            apiClient.entities.Model.list("-created_date", 20),
            apiClient.entities.Dataset.list("-created_date", 10),
            apiClient.entities.Pipeline.list("-created_date", 20),
        ]).then(([exps, mods, dsets, pipes]) => {
            setExperiments(exps);
            setModels(mods);
            setDatasets(dsets);
            setPipelines(pipes);
            setLoading(false);
        });
    }, []);

    const running = experiments.filter(e => e.status === "running").length;
    const failed = experiments.filter(e => e.status === "failed").length;
    const prodModels = models.filter(m => m.stage === "production").length;
    const activeDatasets = datasets.filter(d => d.status === "active").length;
    const recentExps = experiments.slice(0, 6);
    const recentPipelines = pipelines.slice(0, 5);

    return (
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-white tracking-tight">Overview</h1>
                <p className="text-sm text-zinc-500 mt-0.5">Platform health and activity summary</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Running Jobs"
                    value={loading ? "—" : running}
                    sub="active training jobs"
                    icon={Activity}
                    color="blue"
                    trend={12}
                />
                <StatCard
                    label="Total Experiments"
                    value={loading ? "—" : experiments.length}
                    sub="all time"
                    icon={FlaskConical}
                    color="indigo"
                    trend={8}
                />
                <StatCard
                    label="Production Models"
                    value={loading ? "—" : prodModels}
                    sub="in registry"
                    icon={Box}
                    color="green"
                />
                <StatCard
                    label="Failed Jobs"
                    value={loading ? "—" : failed}
                    sub="requires attention"
                    icon={TrendingUp}
                    color={failed > 0 ? "red" : "green"}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Job throughput */}
                <div className="lg:col-span-2 bg-[#111113] border border-[#1f1f23] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <div className="text-sm font-medium text-white">Job Throughput</div>
                            <div className="text-xs text-zinc-500 mt-0.5">Training jobs per day — last 2 weeks</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={mockThroughput}>
                            <defs>
                                <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="jobs" name="Jobs" stroke="#6366f1" strokeWidth={2} fill="url(#jobGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* GPU Utilization */}
                <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-5">
                    <div className="mb-5">
                        <div className="text-sm font-medium text-white">GPU Utilization</div>
                        <div className="text-xs text-zinc-500 mt-0.5">Cluster average — today</div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={mockGpuUtil}>
                            <defs>
                                <linearGradient id="gpuGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#71717a" }} axisLine={false} tickLine={false} interval={5} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="util" name="%" stroke="#10b981" strokeWidth={2} fill="url(#gpuGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Experiments */}
                <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f23]">
                        <div className="text-sm font-medium text-white">Recent Experiments</div>
                        <Link to={createPageUrl("Experiments")} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="p-5 space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : recentExps.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500 text-sm">No experiments yet</div>
                    ) : (
                        <div className="divide-y divide-[#1f1f23]">
                            {recentExps.map(exp => (
                                <div key={exp.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-white truncate">{exp.name}</div>
                                        <div className="text-xs text-zinc-500">{exp.project} · {exp.framework || "—"}</div>
                                    </div>
                                    <StatusBadge status={exp.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Pipelines */}
                <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f23]">
                        <div className="text-sm font-medium text-white">Recent Pipelines</div>
                        <Link to={createPageUrl("Pipelines")} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="p-5 space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : recentPipelines.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500 text-sm">No pipelines yet</div>
                    ) : (
                        <div className="divide-y divide-[#1f1f23]">
                            {recentPipelines.map(pl => (
                                <div key={pl.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-white truncate">{pl.name}</div>
                                        <div className="text-xs text-zinc-500">{pl.type} · {pl.git_branch || "main"}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {pl.duration_seconds && (
                                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {Math.round(pl.duration_seconds / 60)}m
                                            </span>
                                        )}
                                        <StatusBadge status={pl.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick stats bottom row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-4">
                    <div className="text-xs text-zinc-500 mb-1">Datasets</div>
                    <div className="text-xl font-semibold text-white">{loading ? "—" : activeDatasets}</div>
                    <div className="text-xs text-zinc-600 mt-0.5">active versions</div>
                </div>
                <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-4">
                    <div className="text-xs text-zinc-500 mb-1">Queued Jobs</div>
                    <div className="text-xl font-semibold text-white">{loading ? "—" : experiments.filter(e => e.status === "queued").length}</div>
                    <div className="text-xs text-zinc-600 mt-0.5">waiting for GPU</div>
                </div>
                <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-4">
                    <div className="text-xs text-zinc-500 mb-1">Pipelines (CI)</div>
                    <div className="text-xl font-semibold text-white">{loading ? "—" : pipelines.filter(p => p.type === "ci").length}</div>
                    <div className="text-xs text-zinc-600 mt-0.5">ci runs total</div>
                </div>
                <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-4">
                    <div className="text-xs text-zinc-500 mb-1">Staging Models</div>
                    <div className="text-xl font-semibold text-white">{loading ? "—" : models.filter(m => m.stage === "staging").length}</div>
                    <div className="text-xs text-zinc-600 mt-0.5">pending promotion</div>
                </div>
            </div>
        </div>
    );
}