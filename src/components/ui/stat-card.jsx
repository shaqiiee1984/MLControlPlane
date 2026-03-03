import React from 'react';

export default function StatCard({ label, value, sub, icon: Icon, color, trend }) {
    return (
        <div className="bg-[#111113] border border-[#1f1f23] rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs text-zinc-500">{label}</div>
                    <div className="text-xl font-semibold text-white">{value}</div>
                    {sub && <div className="text-xs text-zinc-500">{sub}</div>}
                </div>
                {Icon && <Icon className="w-8 h-8 text-zinc-400" />}
            </div>
        </div>
    );
}
