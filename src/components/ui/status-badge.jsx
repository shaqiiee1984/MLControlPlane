import React from 'react';

export default function StatusBadge({ status }) {
    const color = status === 'running' ? 'text-green-400' : status === 'failed' ? 'text-red-400' : 'text-zinc-400';
    return (
        <span className={`text-xs font-medium ${color} px-2 py-0.5 rounded`}>{status || 'unknown'}</span>
    );
}
