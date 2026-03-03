import { useEffect, useState } from "react";
import { apiClient } from "@/api/clients";
import { Plus, Search, ArrowRight, ChevronDown, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status-badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STAGES = ["draft", "validated", "staging", "production", "archived"];
const STAGE_ORDER = { draft: 0, validated: 1, staging: 2, production: 3, archived: 4 };

function PromoteButton({ model, onUpdate }) {
    const idx = STAGE_ORDER[model.stage] ?? 0;
    const next = STAGES[idx + 1];
    if (!next || model.stage === "archived") return null;
    return (
        <button
            onClick={async (e) => {
                e.stopPropagation();
                const updated = await apiClient.entities.Model.update(model.id, { stage: next });
                onUpdate(updated);
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 whitespace-nowrap"
        >
            → {next}
        </button>
    );
}

export default function ModelRegistry() {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [stageFilter, setStageFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", version: "", framework: "", description: "", project: "" });

    const load = () => {
        apiClient.entities.Model.list("-created_date", 100).then(data => {
            setModels(data);
            setLoading(false);
        });
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const created = await apiClient.entities.Model.create({ ...form, stage: "draft" });
        setModels(prev => [created, ...prev]);
        setShowForm(false);
        setForm({ name: "", version: "", framework: "", description: "", project: "" });
    };

    const handleUpdate = (updated) => {
        setModels(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await apiClient.entities.Model.delete(id);
        setModels(prev => prev.filter(m => m.id !== id));
    };

    const filtered = models.filter(m => {
        const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase());
        const matchStage = stageFilter === "all" || m.stage === stageFilter;
        return matchSearch && matchStage;
    });

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white">Model Registry</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        {models.filter(m => m.stage === "production").length} in production · {models.length} total
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm gap-2">
                    <Plus className="w-4 h-4" /> Register Model
                </Button>
            </div>

            {/* Stage pipeline visualization */}
            <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-5">
                <div className="text-xs text-zinc-500 mb-4">Model Lifecycle Pipeline</div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {STAGES.map((s, i) => {
                        const count = models.filter(m => m.stage === s).length;
                        return (
                            <div key={s} className="flex items-center gap-2 flex-shrink-0">
                                <div
                                    onClick={() => setStageFilter(stageFilter === s ? "all" : s)}
                                    className={cn(
                                        "flex flex-col items-center px-5 py-3 rounded-xl border cursor-pointer transition-all min-w-[100px]",
                                        stageFilter === s
                                            ? "border-indigo-500 bg-indigo-500/10"
                                            : "border-[#27272a] hover:border-[#3a3a3e]"
                                    )}
                                >
                                    <div className="text-lg font-semibold text-white">{count}</div>
                                    <div className="text-xs text-zinc-500 capitalize mt-0.5">{s}</div>
                                </div>
                                {i < STAGES.length - 1 && <ArrowRight className="w-4 h-4 text-zinc-700 flex-shrink-0" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search models…"
                    className="pl-9 bg-[#111113] border-[#27272a] text-white placeholder:text-zinc-600 focus:border-indigo-500 text-sm"
                />
            </div>

            {/* Table */}
            <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#1f1f23]">
                            {["Name", "Version", "Framework", "Stage", "Project", "Size", "Registered", "Actions"].map(h => (
                                <th key={h} className="text-left text-xs text-zinc-500 font-medium px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1d]">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i}>
                                    {Array(8).fill(0).map((_, j) => (
                                        <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center text-zinc-500 py-16">No models found</td>
                            </tr>
                        ) : (
                            filtered.map(model => (
                                <tr key={model.id} className="hover:bg-white/[0.025] transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="text-white font-medium">{model.name}</div>
                                        {model.description && (
                                            <div className="text-xs text-zinc-600 truncate max-w-[200px]">{model.description}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{model.version}</td>
                                    <td className="px-4 py-3 text-zinc-400">{model.framework || "—"}</td>
                                    <td className="px-4 py-3"><StatusBadge status={model.stage} /></td>
                                    <td className="px-4 py-3 text-zinc-400">{model.project || "—"}</td>
                                    <td className="px-4 py-3 text-zinc-500">{model.size_mb ? `${(model.size_mb / 1024).toFixed(1)} GB` : "—"}</td>
                                    <td className="px-4 py-3 text-zinc-500 text-xs">
                                        {model.created_date ? format(new Date(model.created_date), "MMM d, yyyy") : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <PromoteButton model={model} onUpdate={handleUpdate} />
                                            <button
                                                onClick={e => handleDelete(e, model.id)}
                                                className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create form modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-[#111113] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between">
                            <h2 className="text-base font-semibold text-white">Register Model</h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {[
                                { key: "name", label: "Model Name", required: true, placeholder: "gpt2-finetuned" },
                                { key: "version", label: "Version", required: true, placeholder: "1.0.0" },
                                { key: "framework", label: "Framework", placeholder: "pytorch" },
                                { key: "project", label: "Project", placeholder: "nlp-core" },
                                { key: "description", label: "Description", placeholder: "Optional description…" },
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
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-zinc-400">Cancel</Button>
                                <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm">Register</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}