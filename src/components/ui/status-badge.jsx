import React from 'react';

// Color map covering ALL statuses across all entities
const STATUS_STYLES = {
    // Experiment / Pipeline / Job lifecycle
    running: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400 animate-pulse' },
    queued: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
    pending: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
    completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    success: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    failed: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
    canceled: { bg: 'bg-zinc-700/50', text: 'text-zinc-400', dot: 'bg-zinc-500' },

    // Dataset statuses
    active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    deprecated: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
    archived: { bg: 'bg-zinc-700/50', text: 'text-zinc-400', dot: 'bg-zinc-500' },

    // Model stages
    draft: { bg: 'bg-zinc-700/50', text: 'text-zinc-400', dot: 'bg-zinc-500' },
    validated: { bg: 'bg-sky-500/15', text: 'text-sky-400', dot: 'bg-sky-400' },
    staging: { bg: 'bg-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-400' },
    production: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },

    // Priority levels
    critical: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
    high: { bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400' },
    normal: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
    low: { bg: 'bg-zinc-700/50', text: 'text-zinc-500', dot: 'bg-zinc-500' },

    // Node health
    healthy: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    degraded: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
    offline: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
};

const DEFAULT_STYLE = { bg: 'bg-zinc-700/50', text: 'text-zinc-400', dot: 'bg-zinc-500' };

export default function StatusBadge({ status, showDot = true }) {
    if (!status) return null;
    const key = String(status).toLowerCase();
    const { bg, text, dot } = STATUS_STYLES[key] || DEFAULT_STYLE;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${bg} ${text}`}>
            {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />}
            {status}
        </span>
    );
}
