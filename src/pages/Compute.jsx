import { useState } from "react";
import { Cpu, Zap, Users, Shield, BarChart3, Server } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

const TEAMS = [
    { name: "nlp-team", quota: 64, used: 52, priority: "high" },
    { name: "vision-team", quota: 48, used: 31, priority: "normal" },
    { name: "rl-team", quota: 32, used: 32, priority: "critical" },
    { name: "infra-team", quota: 16, used: 4, priority: "low" },
    { name: "research-eng", quota: 40, used: 22, priority: "normal" },
];

const JOBS_QUEUE = [
    { id: "job-001", name: "llama-3-pretrain", team: "nlp-team", gpus: 32, priority: "critical", wait: "0m", status: "running" },
    { id: "job-002", name: "clip-vit-large", team: "vision-team", gpus: 8, priority: "high", wait: "12m", status: "running" },
    { id: "job-003", name: "ppo-agent-v2", team: "rl-team", gpus: 4, priority: "high", wait: "4m", status: "running" },
    { id: "job-004", name: "bert-base-finetune", team: "nlp-team", gpus: 8, priority: "normal", wait: "34m", status: "queued" },
    { id: "job-005", name: "stable-diffusion-xl", team: "vision-team", gpus: 16, priority: "normal", wait: "58m", status: "queued" },
    { id: "job-006", name: "reward-model-v3", team: "rl-team", gpus: 4, priority: "low", wait: "2h 10m", status: "queued" },
];

const PRI_COLORS = { critical: "#ef4444", high: "#f59e0b", normal: "#6366f1", low: "#71717a" };

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
    const totalGpus = 160;
    const usedGpus = TEAMS.reduce((a, t) => a + t.used, 0);
    const freeGpus = totalGpus - usedGpus;

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-semibold text-white">Compute</h1>
                <p className="text-sm text-zinc-500 mt-0.5">GPU quota management and job scheduling</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total GPUs", value: totalGpus, sub: "cluster capacity", color: "text-indigo-400", bg: "bg-indigo-500/10", icon: Cpu },
                    { label: "In Use", value: usedGpus, sub: `${Math.round((usedGpus / totalGpus) * 100)}% utilization`, color: "text-blue-400", bg: "bg-blue-500/10", icon: Zap },
                    { label: "Available", value: freeGpus, sub: "free GPUs", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Server },
                    { label: "Teams", value: TEAMS.length, sub: "with active quotas", color: "text-purple-400", bg: "bg-purple-500/10", icon: Users },
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
                        {TEAMS.map(team => (
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
                        ))}
                    </div>
                </div>

                {/* Bar chart */}
                <div className="lg:col-span-2 bg-[#111113] border border-[#1f1f23] rounded-xl p-5">
                    <div className="text-sm font-medium text-white mb-1">GPU Allocation by Team</div>
                    <div className="text-xs text-zinc-500 mb-5">Used vs Quota</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={TEAMS} barCategoryGap="30%" barGap={4}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }}
                                labelStyle={{ color: "#71717a" }}
                            />
                            <Bar dataKey="quota" name="Quota" fill="#27272a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="used" name="Used" radius={[4, 4, 0, 0]}>
                                {TEAMS.map((t, i) => (
                                    <Cell key={i} fill={PRI_COLORS[t.priority]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Job queue */}
            <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1f1f23] flex items-center justify-between">
                    <div className="text-sm font-medium text-white">Job Queue</div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        {JOBS_QUEUE.filter(j => j.status === "running").length} running
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#1f1f23]">
                            {["Job", "Team", "GPUs", "Priority", "Wait", "Status"].map(h => (
                                <th key={h} className="text-left text-xs text-zinc-500 font-medium px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1d]">
                        {JOBS_QUEUE.map(job => (
                            <tr key={job.id} className="hover:bg-white/[0.02]">
                                <td className="px-4 py-3">
                                    <div className="text-white">{job.name}</div>
                                    <div className="text-xs text-zinc-600 font-mono">{job.id}</div>
                                </td>
                                <td className="px-4 py-3 text-zinc-400">{job.team}</td>
                                <td className="px-4 py-3 text-zinc-300 font-mono">{job.gpus}</td>
                                <td className="px-4 py-3">
                                    <span className="text-xs font-medium" style={{ color: PRI_COLORS[job.priority] }}>
                                        {job.priority}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-zinc-500 text-xs">{job.wait}</td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 text-xs font-medium",
                                        job.status === "running" ? "text-blue-400" : "text-amber-400"
                                    )}>
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            job.status === "running" ? "bg-blue-400 animate-pulse" : "bg-amber-400"
                                        )} />
                                        {job.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}