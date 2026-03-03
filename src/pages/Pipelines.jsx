import { useEffect, useState } from "react";
import { apiClient } from "@/api/clients";
import { Plus, Search, Play, CheckCircle2, XCircle, Clock, Circle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status-badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const TYPE_COLORS = {
    ci: "text-blue-400 bg-blue-500/10",
    cd: "text-purple-400 bg-purple-500/10",
    training: "text-indigo-400 bg-indigo-500/10",
    evaluation: "text-amber-400 bg-amber-500/10",
};

function PipelineStages({ stages }) {
    if (!stages?.length) {
        const mock = ["checkout", "lint", "test", "build", "push"];
        return (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {mock.map((s, i) => (
                    <div key={s} className="flex items-center gap-1">
                        <div className="px-2 py-0.5 bg-white/5 rounded text-xs text-zinc-500">{s}</div>
                        {i < mock.length - 1 && <div className="w-3 h-px bg-zinc-700" />}
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {stages.map((s, i) => (
                <div key={i} className="flex items-center gap-1">
                    <div className="px-2 py-0.5 bg-white/5 rounded text-xs text-zinc-500">{s.name || s}</div>
                    {i < stages.length - 1 && <div className="w-3 h-px bg-zinc-700" />}
                </div>
            ))}
        </div>
    );
}

export default function Pipelines() {
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", type: "ci", git_branch: "main", git_commit: "", project: "", trigger: "manual" });

    useEffect(() => {
        apiClient.entities.Pipeline.list("-created_date", 100).then(data => {
            setPipelines(data);
            setLoading(false);
        });
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const created = await apiClient.entities.Pipeline.create({ ...form, status: "pending" });
        setPipelines(prev => [created, ...prev]);
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        await apiClient.entities.Pipeline.delete(id);
        setPipelines(prev => prev.filter(p => p.id !== id));
    };

    const filtered = pipelines.filter(p => {
        const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" || p.type === typeFilter;
        return matchSearch && matchType;
    });

    const types = ["all", "ci", "cd", "training", "evaluation"];

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white">Pipelines</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        CI/CD and training pipeline runs
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm gap-2">
                    <Plus className="w-4 h-4" /> New Pipeline
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search pipelines…"
                        className="pl-9 bg-[#111113] border-[#27272a] text-white placeholder:text-zinc-600 focus:border-indigo-500 text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {types.map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                typeFilter === t
                                    ? "bg-indigo-500 text-white"
                                    : "bg-[#111113] border border-[#27272a] text-zinc-400 hover:text-zinc-200"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pipeline list */}
            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-20 bg-[#111113] border border-[#1f1f23] rounded-xl animate-pulse" />
                    ))
                ) : filtered.length === 0 ? (
                    <div className="text-center text-zinc-500 py-20">No pipelines found</div>
                ) : (
                    filtered.map(pl => (
                        <div key={pl.id} className="bg-[#111113] border border-[#1f1f23] rounded-xl p-5 hover:border-[#27272a] transition-colors group">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white font-medium">{pl.name}</span>
                                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", TYPE_COLORS[pl.type])}>
                                            {pl.type}
                                        </span>
                                        <StatusBadge status={pl.status} />
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-1">
                                        {pl.git_branch && <span>⎇ {pl.git_branch}</span>}
                                        {pl.git_commit && <span className="font-mono ml-2">{pl.git_commit.slice(0, 7)}</span>}
                                        {pl.project && <span className="ml-2">· {pl.project}</span>}
                                        {pl.trigger && <span className="ml-2">· triggered by {pl.trigger}</span>}
                                    </div>
                                    <PipelineStages stages={pl.stages} />
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {pl.duration_seconds && (
                                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {pl.duration_seconds < 60
                                                ? `${pl.duration_seconds}s`
                                                : `${Math.round(pl.duration_seconds / 60)}m`}
                                        </span>
                                    )}
                                    <span className="text-xs text-zinc-600">
                                        {pl.created_date ? format(new Date(pl.created_date), "MMM d, HH:mm") : ""}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(pl.id)}
                                        className="p-1.5 rounded hover:bg-red-500/10 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-[#111113] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between">
                            <h2 className="text-base font-semibold text-white">New Pipeline</h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {[
                                { key: "name", label: "Pipeline Name", required: true, placeholder: "main-ci" },
                                { key: "git_branch", label: "Git Branch", placeholder: "main" },
                                { key: "git_commit", label: "Git Commit", placeholder: "abc1234" },
                                { key: "project", label: "Project", placeholder: "nlp-core" },
                            ].map(({ key, label, required, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs text-zinc-400 mb-1.5">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
                                    <Input
                                        value={form[key]}
                                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        placeholder={placeholder}
                                        required={required}
                                        className="bg-[#18181b] border-[#27272a] text-white text-sm placeholder:text-zinc-600 focus:border-indigo-500"
                                    />
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { key: "type", label: "Type", options: ["ci", "cd", "training", "evaluation"] },
                                    { key: "trigger", label: "Trigger", options: ["manual", "push", "pull_request", "schedule"] },
                                ].map(({ key, label, options }) => (
                                    <div key={key}>
                                        <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
                                        <select
                                            value={form[key]}
                                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                            className="w-full bg-[#18181b] border border-[#27272a] text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                                        >
                                            {options.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-zinc-400">Cancel</Button>
                                <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm">Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}