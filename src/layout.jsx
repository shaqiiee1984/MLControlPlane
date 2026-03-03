import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
    FlaskConical, LayoutDashboard, Database, Box,
    GitBranch, BarChart3, ChevronLeft, ChevronRight,
    Bell, Settings, User, Cpu, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { label: "Experiments", icon: FlaskConical, page: "Experiments" },
    { label: "Model Registry", icon: Box, page: "ModelRegistry" },
    { label: "Datasets", icon: Database, page: "Datasets" },
    { label: "Pipelines", icon: GitBranch, page: "Pipelines" },
    { label: "Monitoring", icon: BarChart3, page: "Monitoring" },
    { label: "Compute", icon: Cpu, page: "Compute" },
];

export default function Layout({ children, currentPageName }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#09090b] text-white overflow-hidden">
            <style>{`
        :root {
          --accent: #6366f1;
          --accent-light: #818cf8;
          --surface: #111113;
          --border: #1f1f23;
          --muted: #71717a;
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        body { background: #09090b; }
      `}</style>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:relative z-50 h-full flex flex-col border-r border-[#1f1f23] bg-[#0c0c0e] transition-all duration-300",
                    collapsed ? "w-[60px]" : "w-[220px]",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className={cn(
                    "flex items-center border-b border-[#1f1f23] h-14",
                    collapsed ? "justify-center px-0" : "px-4 gap-3"
                )}>
                    <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                        <FlaskConical className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="font-semibold text-sm tracking-tight text-white">MLControlPlane</span>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
                    {navItems.map(({ label, icon: Icon, page }) => {
                        const active = currentPageName === page;
                        return (
                            <Link
                                key={page}
                                to={createPageUrl(page)}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group",
                                    collapsed && "justify-center px-0 w-full",
                                    active
                                        ? "bg-indigo-500/15 text-indigo-400"
                                        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                                )}
                                title={collapsed ? label : undefined}
                            >
                                <Icon className={cn("w-4 h-4 flex-shrink-0", active && "text-indigo-400")} />
                                {!collapsed && <span>{label}</span>}
                                {active && !collapsed && (
                                    <div className="ml-auto w-1 h-1 rounded-full bg-indigo-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className={cn("border-t border-[#1f1f23] p-2 space-y-0.5", collapsed && "px-0")}>
                    <Link
                        to={createPageUrl("Settings")}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all",
                            collapsed && "justify-center px-0 w-full"
                        )}
                    >
                        <Settings className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>Settings</span>}
                    </Link>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex absolute -right-3 top-16 w-6 h-6 rounded-full bg-[#1f1f23] border border-[#27272a] items-center justify-center hover:bg-[#27272a] transition-colors z-10"
                >
                    {collapsed
                        ? <ChevronRight className="w-3 h-3 text-zinc-400" />
                        : <ChevronLeft className="w-3 h-3 text-zinc-400" />
                    }
                </button>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-14 border-b border-[#1f1f23] flex items-center px-4 gap-4 bg-[#09090b] flex-shrink-0">
                    <button
                        className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-zinc-400"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1" />
                    <button className="relative p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 transition-colors">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    </button>
                    <div className="flex items-center gap-2 pl-2 border-l border-[#1f1f23]">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-[#09090b]">
                    {children}
                </main>
            </div>
        </div>
    );
}