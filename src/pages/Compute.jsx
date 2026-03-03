import { useEffect, useState } from "react";
import { apiClient } from "@/api/clients";
import { Cpu, Zap, Users, Server } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/status-badge";

const TEAMS_CONFIG = [
    { name: "nlp-team", quota: 64, priority: "high" },
    { name: "vision-team", quota: 48, priority: "normal" },
    { name: "rl-team", quota: 32, priority: "critical" },
    { name: "infra-team", quota: 16, priority: "low" },
    { name: "research-eng", quota: 40, priority: "normal" },
];

const PRI_COLORS = { critical: "#ef4444", high: "#f59e0b", normal: "#6366f1", low: "#71717a" };

const TOTAL_GPUS = 160;

function QuotaBar({ used, quota, color = "#6366f1" }) {
    const pct = Math.min(100, Math.round((used / quota) * 100));
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-zinc-400">{used} / {quota} GPUs</span>
                <span className={pct >= 90 ? "text-red-400" : pct >= 70 ? "text-amber-400" : "text-zinc-500"}>{pct}%</span>
            </div>
            <div className="w-full bg-[#27272a] rounded-full h-1.5">
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : color }}
                />
            </div>
        </div>
    );
}

export default function Compute() {
    const [experiments, setExperiments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.entities.Experiment.list("-created_date", 100).then(data => {
            setExperiments(data);
            setLoading(false);
        });
    }, []);

    // Active/queued jobs derived from experiments
    const activeJobs = experiments.filter(e => e.status === "running" || e.status === "queued");

    // Compute GPU usage per team from active jobs
    const teamUsage = TEAMS_CONFIG.map(t => {
        const used = activeJobs
            .filter(e => (e.team || "").toLowerCase() === t.name)
            .reduce((sum, e) => sum + (Number(e.gpu_count) || 0), 0);
        return { ...t, used };
    });

    const usedGpus = teamUsage.reduce((a, t) => a + t.used, 0);
    const freeGpus = Math.max(0, TOTAL_GPUS - usedGpus);

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-semibold text-white">Compute</h1>
                <p className="text-sm text-zinc-500 mt-0.5">GPU quota management and job scheduling</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total GPUs", value: TOTAL_GPUS, sub: "cluster capacity", color: "text-indigo-400", bg: "bg-indigo-500/10", icon: Cpu },
                    { label: "In Use", value: loading ? "—" : usedGpus, sub: loading ? "" : `${Math.round((usedGpus / TOTAL_GPUS) * 100)}% utilization`, color: "text-blue-400", bg: "bg-blue-500/10", icon: Zap },
                    { label: "Available", value: loading ? "—" : freeGpus, sub: "free GPUs", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Server },
                    { label: "Teams", value: TEAMS_CONFIG.length, sub: "with active quotas", color: "text-purple-400", bg: "bg-purple-500/10", icon: Users },
                ].map(({ label, value, sub, color, bg, icon: Icon }) => (
                    <div key={label} className="bg-[#111113] border border-[#1f1f23] rounded-xl p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500">{label}</div>
                            <div className="text-2xl font-semibold text-white mt-0.5">{value}</div>
                            <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Team quotas */}
                <div className="lg:col-span-1 bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#1f1f23]">
                        <div className="text-sm font-medium text-white">Team Quotas</div>
                    </div>
                    <div className="p-5 space-y-4">
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
                            ))
                            : teamUsage.map(team => (
                                <div key={team.name}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-zinc-300">{team.name}</span>
                                        <span className={cn(
                                            "text-xs px-1.5 py-0.5 rounded font-medium",
                                            team.priority === "critical" ? "bg-red-500/15 text-red-400" :
                                                team.priority === "high" ? "bg-amber-500/15 text-amber-400" :
                                                    team.priority === "normal" ? "bg-blue-500/15 text-blue-400" :
                                                        "bg-zinc-800 text-zinc-500"
                                        )}>{team.priority}</span>
                                    </div>
                                    <QuotaBar used={team.used} quota={team.quota} />
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Bar chart */}
                <div className="lg:col-span-2 bg-[#111113] border border-[#1f1f23] rounded-xl p-5">
                    <div className="text-sm font-medium text-white mb-1">GPU Allocation by Team</div>
                    <div className="text-xs text-zinc-500 mb-5">Used vs Quota</div>
                    {loading ? (
                        <div className="h-[220px] bg-white/5 rounded animate-pulse" />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={teamUsage} barCategoryGap="30%" barGap={4}>
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }}
                                    labelStyle={{ color: "#71717a" }}
                                />
                                <Bar dataKey="quota" name="Quota" fill="#27272a" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="used" name="Used" radius={[4, 4, 0, 0]}>
                                    {teamUsage.map((t, i) => (
                                        <Cell key={i} fill={PRI_COLORS[t.priority]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Job queue from Experiment entities */}
            <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1f1f23] flex items-center justify-between">
                    <div className="text-sm font-medium text-white">Job Queue</div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        {loading ? "—" : activeJobs.filter(j => j.status === "running").length} running
                        <span className="ml-2 text-amber-400">
                            · {loading ? "—" : activeJobs.filter(j => j.status === "queued").length} queued
                        </span>
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#1f1f23]">
                            {["Job", "Team", "GPUs", "Priority", "Framework", "Status"].map(h => (
                                <th key={h} className="text-left text-xs text-zinc-500 font-medium px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1d]">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i}>
                                    {Array(6).fill(0).map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <div className="h-4 bg-white/5 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : activeJobs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-zinc-500 py-12 text-sm">
                                    No active jobs
                                </td>
                            </tr>
                        ) : (
                            activeJobs.map(job => (
                                <tr key={job.id} className="hover:bg-white/[0.02]">
                                    <td className="px-4 py-3">
                                        <div className="text-white font-medium">{job.name}</div>
                                        {job.git_commit && (
                                            <div className="text-xs text-zinc-600 font-mono">{job.git_commit.slice(0, 7)}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400">{job.team || job.project || "—"}</td>
                                    <td className="px-4 py-3 text-zinc-300 font-mono">{job.gpu_count || "—"}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={job.priority} />
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400 text-xs">{job.framework || "—"}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={job.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}