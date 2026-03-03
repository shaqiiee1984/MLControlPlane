import { useState } from "react";
import { Activity, Cpu, MemoryStick, Zap, Server, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format, subMinutes } from "date-fns";

const now = new Date();

const genTimeSeries = (n, base, noise, decay = 0) =>
    Array.from({ length: n }, (_, i) => ({
        time: format(subMinutes(now, (n - 1 - i) * 5), "HH:mm"),
        value: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * noise - decay * i)),
    }));

const GPU_DATA = genTimeSeries(24, 78, 20);
const MEM_DATA = genTimeSeries(24, 65, 15);
const THROUGHPUT = genTimeSeries(24, 42, 30);
const LATENCY = genTimeSeries(24, 180, 80);

const NODES = [
    { id: "gpu-node-01", gpus: 8, gpu_type: "A100-80GB", util: 92, mem: 71, status: "healthy" },
    { id: "gpu-node-02", gpus: 8, gpu_type: "A100-80GB", util: 87, mem: 68, status: "healthy" },
    { id: "gpu-node-03", gpus: 4, gpu_type: "H100-SXM", util: 98, mem: 84, status: "healthy" },
    { id: "gpu-node-04", gpus: 4, gpu_type: "H100-SXM", util: 45, mem: 40, status: "healthy" },
    { id: "gpu-node-05", gpus: 8, gpu_type: "A100-80GB", util: 0, mem: 3, status: "offline" },
    { id: "gpu-node-06", gpus: 8, gpu_type: "V100-32GB", util: 61, mem: 55, status: "degraded" },
];

const ALERTS = [
    { id: 1, severity: "warning", msg: "Node gpu-node-03 GPU memory at 84%", time: "2 min ago" },
    { id: 2, severity: "info", msg: "Job bert-large-v4 completed successfully", time: "15 min ago" },
    { id: 3, severity: "error", msg: "Node gpu-node-05 went offline", time: "1 hr ago" },
    { id: 4, severity: "info", msg: "Cluster throughput peaked at 98 jobs/hr", time: "3 hr ago" },
];

function MetricChart({ title, sub, data, color, unit }) {
    return (
        <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-5">
            <div className="mb-4">
                <div className="text-sm font-medium text-white">{title}</div>
                {sub && <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>}
            </div>
            <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#52525b" }} axisLine={false} tickLine={false} interval={5} />
                    <YAxis tick={{ fontSize: 9, fill: "#52525b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }}
                        formatter={v => [`${v.toFixed(1)}${unit}`, title]}
                        labelStyle={{ color: "#71717a" }}
                    />
                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#g-${color})`} dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

function UtilBar({ value, color }) {
    return (
        <div className="w-full bg-[#27272a] rounded-full h-1.5 overflow-hidden">
            <div
                className="h-full rounded-full transition-all"
                style={{ width: `${value}%`, background: color }}
            />
        </div>
    );
}

export default function Monitoring() {
    const [tab, setTab] = useState("cluster");

    const avgGpu = Math.round(NODES.filter(n => n.status !== "offline").reduce((a, b) => a + b.util, 0) / NODES.filter(n => n.status !== "offline").length);
    const avgMem = Math.round(NODES.filter(n => n.status !== "offline").reduce((a, b) => a + b.mem, 0) / NODES.filter(n => n.status !== "offline").length);

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white">Monitoring</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">Real-time cluster and job observability</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs text-zinc-400">Live</span>
                </div>
            </div>

            {/* Cluster summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Avg GPU Util", value: `${avgGpu}%`, icon: Cpu, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                    { label: "Avg Memory", value: `${avgMem}%`, icon: MemoryStick, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Active Nodes", value: `${NODES.filter(n => n.status === "healthy").length}/${NODES.length}`, icon: Server, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Alerts", value: ALERTS.filter(a => a.severity !== "info").length, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-[#111113] border border-[#1f1f23] rounded-xl p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500">{label}</div>
                            <div className="text-xl font-semibold text-white mt-0.5">{value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricChart title="GPU Utilization" sub="Cluster avg %" data={GPU_DATA} color="#6366f1" unit="%" />
                <MetricChart title="GPU Memory" sub="Cluster avg %" data={MEM_DATA} color="#3b82f6" unit="%" />
                <MetricChart title="Throughput" sub="Jobs / hour" data={THROUGHPUT} color="#10b981" unit="" />
                <MetricChart title="Step Latency" sub="ms / step" data={LATENCY} color="#f59e0b" unit="ms" />
            </div>

            {/* Node table */}
            <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1f1f23]">
                    <div className="text-sm font-medium text-white">Node Health</div>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#1f1f23]">
                            {["Node ID", "GPU Type", "GPUs", "GPU Util", "Memory", "Status"].map(h => (
                                <th key={h} className="text-left text-xs text-zinc-500 font-medium px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1d]">
                        {NODES.map(node => (
                            <tr key={node.id} className="hover:bg-white/[0.02]">
                                <td className="px-4 py-3 font-mono text-xs text-zinc-300">{node.id}</td>
                                <td className="px-4 py-3 text-zinc-400 text-xs">{node.gpu_type}</td>
                                <td className="px-4 py-3 text-zinc-300">{node.gpus}</td>
                                <td className="px-4 py-3 w-40">
                                    <div className="flex items-center gap-2">
                                        <UtilBar value={node.util} color="#6366f1" />
                                        <span className="text-xs text-zinc-400 w-8">{node.util}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 w-40">
                                    <div className="flex items-center gap-2">
                                        <UtilBar value={node.mem} color="#3b82f6" />
                                        <span className="text-xs text-zinc-400 w-8">{node.mem}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${node.status === "healthy" ? "text-emerald-400" :
                                            node.status === "degraded" ? "text-amber-400" : "text-red-400"
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${node.status === "healthy" ? "bg-emerald-400" :
                                                node.status === "degraded" ? "bg-amber-400" : "bg-red-400"
                                            }`} />
                                        {node.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Alerts */}
            <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1f1f23]">
                    <div className="text-sm font-medium text-white">Recent Alerts</div>
                </div>
                <div className="divide-y divide-[#1a1a1d]">
                    {ALERTS.map(alert => (
                        <div key={alert.id} className="flex items-center gap-3 px-5 py-3">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${alert.severity === "error" ? "bg-red-400" :
                                    alert.severity === "warning" ? "bg-amber-400" : "bg-blue-400"
                                }`} />
                            <span className="text-sm text-zinc-300 flex-1">{alert.msg}</span>
                            <span className="text-xs text-zinc-600">{alert.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}