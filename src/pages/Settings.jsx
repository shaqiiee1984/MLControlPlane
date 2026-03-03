import { useState } from "react";
import { Shield, Bell, Key, Users, Globe, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
    { id: "general", label: "General", icon: Globe },
    { id: "team", label: "Team & Access", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
];

function Toggle({ enabled, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={cn(
                "relative inline-flex h-5 w-9 rounded-full transition-colors",
                enabled ? "bg-indigo-500" : "bg-zinc-700"
            )}
        >
            <span className={cn(
                "inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform mt-[3px]",
                enabled ? "translate-x-4" : "translate-x-1"
            )} />
        </button>
    );
}

export default function Settings() {
    const [tab, setTab] = useState("general");
    const [notifs, setNotifs] = useState({
        job_complete: true, job_failed: true, model_promoted: false, alert_critical: true, weekly_digest: false
    });

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-semibold text-white">Settings</h1>
                <p className="text-sm text-zinc-500 mt-0.5">Platform configuration and preferences</p>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 bg-[#111113] border border-[#1f1f23] p-1 rounded-xl w-fit">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all",
                            tab === id ? "bg-[#1f1f23] text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                    </button>
                ))}
            </div>

            {tab === "general" && (
                <div className="space-y-5">
                    <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-6 space-y-4">
                        <div className="text-sm font-medium text-white mb-2">Platform Settings</div>
                        {[
                            { label: "Organization Name", placeholder: "Acme AI Research", defaultValue: "" },
                            { label: "Default Project", placeholder: "nlp-core", defaultValue: "" },
                            { label: "Container Registry URL", placeholder: "ghcr.io/your-org", defaultValue: "" },
                            { label: "Artifact Storage Bucket", placeholder: "s3://ml-artifacts", defaultValue: "" },
                        ].map(({ label, placeholder, defaultValue }) => (
                            <div key={label}>
                                <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
                                <Input
                                    placeholder={placeholder}
                                    defaultValue={defaultValue}
                                    className="bg-[#18181b] border-[#27272a] text-white text-sm placeholder:text-zinc-600 focus:border-indigo-500"
                                />
                            </div>
                        ))}
                        <div className="flex justify-end pt-2">
                            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm gap-2">
                                <Save className="w-3.5 h-3.5" /> Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {tab === "team" && (
                <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#1f1f23]">
                        <div className="text-sm font-medium text-white">Team Members</div>
                    </div>
                    <div className="divide-y divide-[#1f1f23]">
                        {[
                            { name: "Alice Chen", email: "alice@acme.ai", role: "Administrator" },
                            { name: "Bob Nakamura", email: "bob@acme.ai", role: "ML Engineer" },
                            { name: "Carol Smith", email: "carol@acme.ai", role: "Researcher" },
                            { name: "David Lee", email: "david@acme.ai", role: "Platform Engineer" },
                        ].map(({ name, email, role }) => (
                            <div key={email} className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-medium">
                                        {name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm text-white">{name}</div>
                                        <div className="text-xs text-zinc-500">{email}</div>
                                    </div>
                                </div>
                                <span className="text-xs text-zinc-400 px-2 py-1 bg-white/5 rounded">{role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === "notifications" && (
                <div className="bg-[#111113] border border-[#1f1f23] rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#1f1f23]">
                        <div className="text-sm font-medium text-white">Notification Preferences</div>
                    </div>
                    <div className="divide-y divide-[#1f1f23]">
                        {[
                            { key: "job_complete", label: "Job Completed", sub: "Notify when a training job finishes" },
                            { key: "job_failed", label: "Job Failed", sub: "Notify when a training job fails" },
                            { key: "model_promoted", label: "Model Promoted", sub: "Notify when a model stage changes" },
                            { key: "alert_critical", label: "Critical Alerts", sub: "Cluster health and infrastructure alerts" },
                            { key: "weekly_digest", label: "Weekly Digest", sub: "Summary of experiments and metrics" },
                        ].map(({ key, label, sub }) => (
                            <div key={key} className="flex items-center justify-between px-6 py-4">
                                <div>
                                    <div className="text-sm text-white">{label}</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>
                                </div>
                                <Toggle
                                    enabled={notifs[key]}
                                    onChange={v => setNotifs(n => ({ ...n, [key]: v }))}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === "security" && (
                <div className="space-y-4">
                    <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-6 space-y-4">
                        <div className="text-sm font-medium text-white mb-2">API Keys</div>
                        <div className="flex items-center justify-between p-3 bg-[#18181b] rounded-lg border border-[#27272a]">
                            <div>
                                <div className="text-xs text-zinc-300 font-mono">rops_sk_live_••••••••••••abc4</div>
                                <div className="text-xs text-zinc-600 mt-0.5">Created Jan 12, 2026 · Last used 2h ago</div>
                            </div>
                            <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                        </div>
                        <Button variant="outline" className="border-[#27272a] text-zinc-300 hover:text-white text-sm gap-2">
                            <Key className="w-3.5 h-3.5" /> Generate New Key
                        </Button>
                    </div>
                    <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-6">
                        <div className="text-sm font-medium text-white mb-1">OAuth / SSO</div>
                        <div className="text-xs text-zinc-500 mb-4">Configure OpenID Connect for enterprise SSO</div>
                        {[
                            { label: "OIDC Issuer URL", placeholder: "https://accounts.google.com" },
                            { label: "Client ID", placeholder: "your-client-id" },
                        ].map(({ label, placeholder }) => (
                            <div key={label} className="mb-3">
                                <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
                                <Input
                                    placeholder={placeholder}
                                    type={label.includes("Client") ? "password" : "text"}
                                    className="bg-[#18181b] border-[#27272a] text-white text-sm placeholder:text-zinc-600 focus:border-indigo-500"
                                />
                            </div>
                        ))}
                        <Button className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm mt-2">Save SSO Config</Button>
                    </div>
                </div>
            )}
        </div>
    );
}