import { useEffect, useState } from "react";
import { apiClient } from "@/api/clients";
import { Plus, Search, Filter, SlidersHorizontal, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status-badge";
import ExperimentForm from "@/components/experiments/ExperimentForm";
import ExperimentDetail from "@/components/experiments/ExperimentDetail";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STATUSES = ["all", "queued", "running", "completed", "failed", "canceled", "draft"];
const FRAMEWORKS = ["all", "pytorch", "tensorflow", "jax", "huggingface", "custom"];

export default function Experiments() {
    const [experiments, setExperiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [fwFilter, setFwFilter] = useState("all");

    const load = () => {
        apiClient.entities.Experiment.list("-created_date", 100).then(data => {
            setExperiments(data);
            setLoading(false);
        });
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await apiClient.entities.Experiment.delete(id);
        setExperiments(prev => prev.filter(ex => ex.id !== id));
    };

    const filtered = experiments.filter(e => {
        const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) ||
            e.project?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || e.status === statusFilter;
        const matchFw = fwFilter === "all" || e.framework === fwFilter;
        return matchSearch && matchStatus && matchFw;
    });

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white">Experiments</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">{experiments.length} total · {experiments.filter(e => e.status === "running").length} running</p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm gap-2"
                >
                    <Plus className="w-4 h-4" /> New Experiment
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search experiments…"
                        className="pl-9 bg-[#111113] border-[#27272a] text-white placeholder:text-zinc-600 focus:border-indigo-500 text-sm"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {STATUSES.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                statusFilter === s
                                    ? "bg-indigo-500 text-white"
                                    : "bg-[#111113] border border-[#27272a] text-zinc-400 hover:text-zinc-200"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <select
                    value={fwFilter}
                    onChange={e => setFwFilter(e.target.value)}
                    className="bg-[#111113] border border-[#27272a] text-zinc-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                    {FRAMEWORKS.map(f => <option key={f} value={f}>{f === "all" ? "All frameworks" : f}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#1f1f23]">
                            {["Name", "Project", "Framework", "Status", "Priority", "GPUs", "Created", ""].map(h => (
                                <th key={h} className="text-left text-xs text-zinc-500 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1d]">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array(8).fill(0).map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <div className="h-4 bg-white/5 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center text-zinc-500 py-16 text-sm">
                                    No experiments found
                                </td>
                            </tr>
                        ) : (
                            filtered.map(exp => (
                                <tr
                                    key={exp.id}
                                    onClick={() => setSelected(exp)}
                                    className="hover:bg-white/[0.025] cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <div className="text-white font-medium">{exp.name}</div>
                                        {exp.git_commit && (
                                            <div className="text-xs text-zinc-600 font-mono">{exp.git_commit.slice(0, 7)}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400">{exp.project}</td>
                                    <td className="px-4 py-3 text-zinc-400">{exp.framework || "—"}</td>
                                    <td className="px-4 py-3"><StatusBadge status={exp.status} /></td>
                                    <td className="px-4 py-3"><StatusBadge status={exp.priority} /></td>
                                    <td className="px-4 py-3">
                                        <span className="text-zinc-300 font-mono">
                                            {exp.gpu_count ? `${exp.gpu_count}×GPU` : "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500 text-xs">
                                        {exp.created_date ? format(new Date(exp.created_date), "MMM d, HH:mm") : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={e => handleDelete(e, exp.id)}
                                            className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <ExperimentForm
                    onClose={() => setShowForm(false)}
                    onCreated={exp => setExperiments(prev => [exp, ...prev])}
                />
            )}
            {selected && (
                <ExperimentDetail experiment={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    );
}