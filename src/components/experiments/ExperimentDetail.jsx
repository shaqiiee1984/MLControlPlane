import { X, GitCommit, Cpu, MemoryStick, Layers, Tag, Clock } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const mockLoss = Array.from({ length: 30 }, (_, i) => ({
    step: (i + 1) * 100,
    train: +(3.2 * Math.exp(-0.08 * i) + 0.1 + Math.random() * 0.05).toFixed(4),
    val: +(3.5 * Math.exp(-0.07 * i) + 0.15 + Math.random() * 0.08).toFixed(4),
}));

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between py-2 border-b border-[#1f1f23]">
            <span className="text-xs text-zinc-500">{label}</span>
            <span className="text-xs text-zinc-200 font-mono max-w-[60%] text-right break-all">{value || "—"}</span>
        </div>
    );
}

export default function ExperimentDetail({ experiment, onClose }) {
    if (!experiment) return null;
    const hp = experiment.hyperparameters || {};

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl bg-[#111113] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-[#1f1f23] flex-shrink-0">
                    <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base font-semibold text-white truncate">{experiment.name}</h2>
                            <StatusBadge status={experiment.status} />
                            <StatusBadge status={experiment.priority} />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">{experiment.project} · {experiment.team || "—"}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 flex-shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Metadata */}
                        <div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Configuration</div>
                            <InfoRow label="Framework" value={experiment.framework} />
                            <InfoRow label="Container" value={experiment.container_image} />
                            <InfoRow label="Git Commit" value={experiment.git_commit} />
                            <InfoRow label="Dataset Version" value={experiment.dataset_version} />
                            <InfoRow label="Created" value={experiment.created_date ? format(new Date(experiment.created_date), "MMM d, yyyy HH:mm") : "—"} />
                            {experiment.duration_seconds && (
                                <InfoRow label="Duration" value={`${Math.round(experiment.duration_seconds / 60)} min`} />
                            )}
                        </div>

                        {/* Compute */}
                        <div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Compute</div>
                            <InfoRow label="GPU Count" value={experiment.gpu_count} />
                            <InfoRow label="GPU Type" value={experiment.gpu_type} />
                            <InfoRow label="Nodes" value={experiment.node_count} />
                            <InfoRow label="CPUs" value={experiment.cpu_count} />
                            <InfoRow label="Memory" value={experiment.memory_gb ? `${experiment.memory_gb} GB` : null} />

                            {Object.keys(hp).length > 0 && (
                                <div className="mt-4">
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Hyperparameters</div>
                                    {Object.entries(hp).map(([k, v]) => (
                                        <InfoRow key={k} label={k} value={String(v)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Loss chart */}
                    <div className="px-6 pb-6">
                        <div className="bg-[#0c0c0e] border border-[#1f1f23] rounded-xl p-5">
                            <div className="text-xs text-zinc-400 mb-4">Training Loss</div>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={mockLoss}>
                                    <XAxis dataKey="step" tick={{ fontSize: 9, fill: "#71717a" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 11 }} />
                                    <Legend wrapperStyle={{ fontSize: 11, color: "#71717a" }} />
                                    <Line type="monotone" dataKey="train" name="Train" stroke="#6366f1" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="val" name="Validation" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tags */}
                    {experiment.tags?.length > 0 && (
                        <div className="px-6 pb-6 flex items-center gap-2 flex-wrap">
                            <Tag className="w-3 h-3 text-zinc-600" />
                            {experiment.tags.map(t => (
                                <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-zinc-400">{t}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}