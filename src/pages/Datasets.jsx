import { useEffect, useState } from "react";
import { apiClient } from "@/api/clients";
import { Plus, Search, Database, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status-badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const FORMATS = ["parquet", "csv", "jsonl", "tfrecord", "hdf5", "images", "other"];

export default function Datasets() {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", version: "", description: "", format: "parquet", project: "", source_url: "", size_gb: "", row_count: "", tags: "" });

    useEffect(() => {
        apiClient.entities.Dataset.list("-created_date", 100).then(data => {
            setDatasets(data);
            setLoading(false);
        });
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const created = await apiClient.entities.Dataset.create({
            ...form,
            status: "active",
            size_gb: form.size_gb ? Number(form.size_gb) : undefined,
            row_count: form.row_count ? Number(form.row_count) : undefined,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        });
        setDatasets(prev => [created, ...prev]);
        setShowForm(false);
        setForm({ name: "", version: "", description: "", format: "parquet", project: "", source_url: "", size_gb: "", row_count: "", tags: "" });
    };

    const handleDelete = async (id) => {
        await apiClient.entities.Dataset.delete(id);
        setDatasets(prev => prev.filter(d => d.id !== id));
    };

    const filtered = datasets.filter(d =>
        !search || d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.project?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white">Datasets</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">{datasets.length} dataset versions tracked</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm gap-2">
                    <Plus className="w-4 h-4" /> Add Dataset
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search datasets…"
                    className="pl-9 bg-[#111113] border-[#27272a] text-white placeholder:text-zinc-600 focus:border-indigo-500 text-sm"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 bg-[#111113] border border-[#1f1f23] rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center text-zinc-500 py-20">
                    <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No datasets yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(ds => (
                        <div key={ds.id} className="bg-[#111113] border border-[#1f1f23] rounded-xl p-5 hover:border-[#27272a] transition-colors group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Database className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={ds.status} />
                                    <button
                                        onClick={() => handleDelete(ds.id)}
                                        className="p-1 rounded hover:bg-red-500/10 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-white font-medium mb-0.5">{ds.name}</div>
                            <div className="text-xs text-zinc-500 mb-3">
                                v{ds.version} · {ds.format || "—"} {ds.project ? `· ${ds.project}` : ""}
                            </div>
                            {ds.description && (
                                <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{ds.description}</p>
                            )}
                            {ds.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {ds.tags.slice(0, 3).map(t => (
                                        <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-xs text-zinc-500">{t}</span>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-zinc-600">
                                <span>{ds.size_gb ? `${ds.size_gb} GB` : ""}</span>
                                <span>{ds.row_count ? `${ds.row_count.toLocaleString()} rows` : ""}</span>
                                <span>{ds.created_date ? format(new Date(ds.created_date), "MMM d") : ""}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-[#111113] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between">
                            <h2 className="text-base font-semibold text-white">Add Dataset Version</h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {[
                                { key: "name", label: "Dataset Name", required: true, placeholder: "imagenet-clean" },
                                { key: "version", label: "Version", required: true, placeholder: "2.4.1" },
                                { key: "project", label: "Project", placeholder: "vision-core" },
                                { key: "source_url", label: "Source URL", placeholder: "s3://bucket/path" },
                                { key: "description", label: "Description", placeholder: "Optional…" },
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
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1.5">Size (GB)</label>
                                    <Input
                                        type="number" min={0} step="0.1"
                                        value={form.size_gb}
                                        onChange={e => setForm(f => ({ ...f, size_gb: e.target.value }))}
                                        placeholder="142.4"
                                        className="bg-[#18181b] border-[#27272a] text-white text-sm placeholder:text-zinc-600 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1.5">Row Count</label>
                                    <Input
                                        type="number" min={0}
                                        value={form.row_count}
                                        onChange={e => setForm(f => ({ ...f, row_count: e.target.value }))}
                                        placeholder="1000000"
                                        className="bg-[#18181b] border-[#27272a] text-white text-sm placeholder:text-zinc-600 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5">Format</label>
                                <select
                                    value={form.format}
                                    onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
                                    className="w-full bg-[#18181b] border border-[#27272a] text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                                >
                                    {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5">Tags <span className="text-zinc-600">(comma-separated)</span></label>
                                <Input
                                    value={form.tags}
                                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                                    placeholder="vision, classification, curated"
                                    className="bg-[#18181b] border-[#27272a] text-white text-sm placeholder:text-zinc-600 focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-zinc-400">Cancel</Button>
                                <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm">Add Dataset</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}