import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FIELDS = [
    { key: "name", label: "Experiment Name", required: true, placeholder: "bert-finetune-v3" },
    { key: "project", label: "Project", required: true, placeholder: "nlp-core" },
    { key: "description", label: "Description", placeholder: "Short description…" },
    { key: "git_commit", label: "Git Commit", placeholder: "abc1234" },
    { key: "container_image", label: "Container Image", placeholder: "ghcr.io/org/trainer:latest" },
    { key: "dataset_version", label: "Dataset Version", placeholder: "v2.1.0" },
    { key: "team", label: "Team", placeholder: "nlp-team" },
];

const FRAMEWORKS = ["pytorch", "tensorflow", "jax", "huggingface", "custom"];
const PRIORITIES = ["low", "normal", "high", "critical"];

export default function ExperimentForm({ onClose, onCreated }) {
    const [form, setForm] = useState({
        status: "queued",
        priority: "normal",
        gpu_count: 8,
        cpu_count: 32,
        memory_gb: 128,
        node_count: 1,
        framework: "pytorch",
    });
    const [hparams, setHparams] = useState([{ key: "", value: "" }]);
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleHparam = (i, field, val) => {
        setHparams(h => h.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const hp = {};
        hparams.forEach(({ key, value }) => { if (key) hp[key] = value; });
        const payload = { ...form, hyperparameters: hp };
        const created = await base44.entities.Experiment.create(payload);
        setSaving(false);
        onCreated(created);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-[#111113] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f23]">
                    <div>
                        <h2 className="text-base font-semibold text-white">New Experiment</h2>
                        <p className="text-xs text-zinc-500 mt-0.5">Submit a training job to the queue</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh]">
                    <div className="p-6 space-y-5">
                        {/* Text fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {FIELDS.map(({ key, label, required, placeholder }) => (
                                <div key={key} className={key === "description" ? "sm:col-span-2" : ""}>
                                    <label className="block text-xs text-zinc-400 mb-1.5">
                                        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
                                    </label>
                                    <Input
                                        value={form[key] || ""}
                                        onChange={e => set(key, e.target.value)}
                                        placeholder={placeholder}
                                        required={required}
                                        className="bg-[#18181b] border-[#27272a] text-white text-sm placeholder:text-zinc-600 focus:border-indigo-500"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Selects */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { key: "framework", label: "Framework", options: FRAMEWORKS },
                                { key: "priority", label: "Priority", options: PRIORITIES },
                            ].map(({ key, label, options }) => (
                                <div key={key} className="sm:col-span-2">
                                    <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
                                    <select
                                        value={form[key] || ""}
                                        onChange={e => set(key, e.target.value)}
                                        className="w-full bg-[#18181b] border border-[#27272a] text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                                    >
                                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* Compute */}
                        <div>
                            <div className="text-xs text-zinc-400 mb-3">Compute Resources</div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { key: "gpu_count", label: "GPUs" },
                                    { key: "node_count", label: "Nodes" },
                                    { key: "cpu_count", label: "CPUs" },
                                    { key: "memory_gb", label: "Memory (GB)" },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <label className="block text-xs text-zinc-500 mb-1.5">{label}</label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={form[key] || ""}
                                            onChange={e => set(key, Number(e.target.value))}
                                            className="bg-[#18181b] border-[#27272a] text-white text-sm placeholder:text-zinc-600 focus:border-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hyperparameters */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-xs text-zinc-400">Hyperparameters</div>
                                <button
                                    type="button"
                                    onClick={() => setHparams(h => [...h, { key: "", value: "" }])}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {hparams.map((row, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input
                                            value={row.key}
                                            onChange={e => handleHparam(i, "key", e.target.value)}
                                            placeholder="learning_rate"
                                            className="bg-[#18181b] border-[#27272a] text-white text-sm placeholder:text-zinc-600 focus:border-indigo-500"
                                        />
                                        <Input
                                            value={row.value}
                                            onChange={e => handleHparam(i, "value", e.target.value)}
                                            placeholder="3e-4"
                                            className="bg-[#18181b] border-[#27272a] text-white text-sm placeholder:text-zinc-600 focus:border-indigo-500"
                                        />
                                        {hparams.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setHparams(h => h.filter((_, idx) => idx !== i))}
                                                className="p-2 text-zinc-600 hover:text-red-400"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-[#1f1f23] flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm"
                        >
                            {saving ? "Submitting…" : "Submit Job"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}