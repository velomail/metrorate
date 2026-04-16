import { useEffect, useRef, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { GlassCard } from "./components/GlassCard";
import { LogTab } from "./components/LogTab";
import { TodayTab } from "./components/TodayTab";
import { HistoryTab } from "./components/HistoryTab";
import { useCommission } from "./hooks/useCommission";
import { storage } from "./lib/storage";
import { LANDING_PAGE_URL, SUPPORT_PAGE_URL } from "./config/landing";

function formatCurrency(value: number, isHushed: boolean) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);

  return (
    <span className={isHushed ? "blur-md select-none" : ""}>{formatted}</span>
  );
}

type NavId = "log" | "dashboard" | "history" | "settings";

const NAV_ITEMS: { id: NavId; icon: string; label: string; title: string; path: string }[] = [
  { id: "log",       icon: "edit_square", label: "Log",      title: "Log a new deal",   path: "/" },
  { id: "dashboard", icon: "event",       label: "Today",    title: "Today's overview", path: "/today" },
  { id: "history",   icon: "history",     label: "History",  title: "Deal history",     path: "/history" },
  { id: "settings",  icon: "settings",    label: "Settings", title: "Settings",         path: "/settings" },
];

export function App() {
  const {
    deals,
    presets,
    addDealFromInput,
    addDealPreset,
    addPreset,
    removePreset,
    totalValue,
    isHushed,
    setIsHushed,
    isPaid,
    commissionRate,
    setCommissionRate,
    commissionThisMonth,
    quota,
    setQuota,
    attainmentPercent,
    goal,
    setGoal,
    isAtFreeLimit,
    dealsTodayCount,
    freeDailyLimit,
    clearDeals
  } = useCommission();

  const navigate = useNavigate();
  const location = useLocation();

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetValue, setNewPresetValue] = useState("");
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const presetsListRef = useRef<HTMLDivElement>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    if (isAddingPreset && presetsListRef.current) {
      const el = presetsListRef.current;
      requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    }
  }, [isAddingPreset]);

  useEffect(() => {
    storage.get<boolean>("metrorate:hasSeenOnboarding", false).then((seen) => {
      if (!seen) setShowOnboarding(true);
    });
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    storage.set("metrorate:hasSeenOnboarding", true);
  };

  const hasRestoredPage = useRef(false);
  useEffect(() => {
    if (hasRestoredPage.current) return;
    hasRestoredPage.current = true;
    if (location.pathname !== "/") return;
    storage.get<string>("metrorate:lastPage", "/").then((path) => {
      const valid = NAV_ITEMS.map((n) => n.path);
      if (valid.includes(path) && path !== "/") navigate(path, { replace: true });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    storage.set("metrorate:lastPage", location.pathname);
  }, [location.pathname]);

  const recentDeals = deals.slice(0, 4);
  const progress =
    goal > 0 ? Math.min(100, Math.round((commissionThisMonth / goal) * 100)) : 0;
  const commissionPercent = Math.round(commissionRate * 100);

  const handleAddDeal = () => {
    if (!input.trim()) return;
    const created = addDealFromInput(input);
    if (!created) {
      setError("Couldn\u2019t read that. Try \u201cNike 50k\u201d or \u201cACME 12,500\u201d.");
      return;
    }
    setError(null);
    setInput("");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isAtFreeLimit) handleAddDeal();
    }
  };

  const handleAddPreset = () => {
    const value = Number(newPresetValue.replace(/,/g, ""));
    const created = addPreset(newPresetName, value);
    if (created) {
      setNewPresetName("");
      setNewPresetValue("");
      setIsAddingPreset(false);
    }
  };

  const activeNavId =
    NAV_ITEMS.find((n) => n.path === location.pathname)?.id ?? "log";

  const pageTitle = NAV_ITEMS.find((n) => n.id === activeNavId)?.label ?? "MetroRate";

  // Shared navigate-to-page helper (for child components using string page IDs)
  const goToPage = (p: "log" | "dashboard" | "history" | "settings") =>
    navigate(NAV_ITEMS.find((n) => n.id === p)?.path ?? "/");

  // ── Settings content (shared between mobile route and desktop sidebar-aware route)
  const SettingsContent = (
    <section className="pt-6 pb-8 space-y-6">
      {/* Top row: Account + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">account_circle</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-heading">Account &amp; Plan</h3>
              <p className="text-sm text-muted">
                {isPaid
                  ? "Unlimited logs"
                  : `Free Plan (${freeDailyLimit} logs/day). Unlock unlimited with lifetime.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="w-full bg-primary hover:bg-primary/90 text-primary-content font-bold py-2.5 rounded-lg transition-colors text-sm"
            onClick={() => window.open(LANDING_PAGE_URL, "_blank", "noopener,noreferrer")}
          >
            {isPaid ? "Manage billing" : "Unlock Lifetime Usage"}
          </button>
          <div className="text-center">
            <a
              href={SUPPORT_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary/80 hover:text-primary underline"
            >
              Contact Support
            </a>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col gap-4">
          <h3 className="font-bold mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">target</span>
            Commission Goals
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Monthly Goal ($)</label>
              <input
                type="number"
                min={1}
                step={1}
                className="w-full bg-slate-50 border border-border rounded-lg px-3 py-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={goal}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isNaN(v) && v > 0) setGoal(Math.round(v));
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Monthly Quota (Revenue)</label>
              <input
                type="number"
                min={0}
                step={1}
                className="w-full bg-slate-50 border border-border rounded-lg px-3 py-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={quota || ""}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isNaN(v) || v < 0) { setQuota(0); return; }
                  setQuota(Math.round(v));
                }}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Bottom row: Rate + Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">percent</span>
              Rate Defaults
            </h3>
            <span className="text-primary font-bold text-sm">{commissionPercent}%</span>
          </div>
          <label className="block text-xs font-medium text-muted mb-2">Commission Rate (%)</label>
          <input
            type="range"
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            min={1}
            max={100}
            step={1}
            value={commissionPercent}
            onChange={(e) => setCommissionRate(Number(e.target.value) / 100)}
          />
        </GlassCard>

        <GlassCard className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">inventory_2</span>
              Presets &amp; Packages
            </h3>
            <button
              type="button"
              className="text-xs font-bold text-primary flex items-center gap-1 hover:bg-primary/5 px-2 py-1 rounded transition-colors"
              onClick={() => { setIsAddingPreset(true); setNewPresetName(""); setNewPresetValue(""); }}
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add New
            </button>
          </div>
          <div ref={presetsListRef} className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-hide">
            {presets.map((preset) => (
              <div key={preset.id} className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-0.5">Package</span>
                    <span className="text-sm font-semibold text-heading truncate">{preset.name}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-2">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-0.5">Amount</span>
                    <span className="text-sm font-bold text-primary">{formatCurrency(preset.value, isHushed)}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    className="material-symbols-outlined text-muted text-sm cursor-pointer hover:text-primary transition-colors"
                    onClick={() => removePreset(preset.id)}
                    aria-label="Delete preset"
                  >
                    delete
                  </button>
                </div>
              </div>
            ))}
            {presets.length === 0 && !isAddingPreset && (
              <p className="text-[11px] text-muted msg-bubble msg-bubble-info">
                No presets yet. Click "Add New" to create your first package.
              </p>
            )}
            {isAddingPreset && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-primary uppercase mb-1">Package Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mid-Market"
                      className="w-full bg-white border border-border rounded-md text-sm px-2 py-1.5 text-heading placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-primary uppercase mb-1">Deal Amount ($)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 5000"
                      className="w-full bg-white border border-border rounded-md text-sm px-2 py-1.5 text-heading placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={newPresetValue}
                      onChange={(e) => setNewPresetValue(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 bg-primary text-primary-content text-xs font-bold py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    onClick={handleAddPreset}
                    disabled={!newPresetName.trim() || !newPresetValue.trim()}
                  >
                    Save Preset
                  </button>
                  <button
                    type="button"
                    className="px-3 border border-border text-muted text-xs font-bold py-2 rounded-md hover:bg-slate-100 transition-colors"
                    onClick={() => { setIsAddingPreset(false); setNewPresetName(""); setNewPresetValue(""); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Privacy row */}
      <div className="pt-2 pb-2 flex items-center justify-between border-t border-border px-1">
        <div className="min-w-0 pr-4">
          <p className="text-xs font-bold text-muted uppercase tracking-tight">Privacy Mode</p>
          <p className="text-xs text-muted leading-relaxed mt-0.5">
            Hides commission amounts — perfect for working in public or sharing your screen.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isHushed}
            onChange={(e) => setIsHushed(e.target.checked)}
          />
          <div className="w-11 h-6 bg-slate-200 rounded-full peer focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
        </label>
      </div>
    </section>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 bg-white border-r border-border h-screen sticky top-0 shrink-0 shadow-sm">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[18px]">bolt</span>
            </div>
            <div>
              <span className="font-black text-base text-heading tracking-tight">MetroRate</span>
              <p className="text-[10px] text-muted leading-none mt-0.5">Commission Tracker</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ id, icon, label, title, path }) => {
            const active = activeNavId === id;
            return (
              <button
                key={id}
                onClick={() => navigate(path)}
                title={title}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-slate-50 hover:text-heading"
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${active ? "text-primary" : "text-slate-400"}`}>
                  {icon}
                </span>
                {label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer: privacy + plan badge */}
        <div className="px-4 py-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-heading">Privacy Mode</p>
              <p className="text-[10px] text-muted mt-0.5">Hide earnings</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isHushed}
                onChange={(e) => setIsHushed(e.target.checked)}
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
          <div className={`rounded-lg px-3 py-2 text-center text-[11px] font-semibold ${isPaid ? "bg-emerald-50 text-emerald-700" : "bg-primary/5 text-primary"}`}>
            {isPaid ? "Unlimited Plan" : `Free · ${Math.max(freeDailyLimit - dealsTodayCount, 0)} logs left today`}
          </div>
        </div>
      </aside>

      {/* ── Right side: header + content + mobile nav ───────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen lg:h-screen lg:overflow-hidden">

        {/* Desktop top header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-border shrink-0">
          <div>
            <h1 className="text-lg font-bold text-heading">{pageTitle}</h1>
            <p className="text-[11px] text-muted mt-0.5">
              {activeNavId === "log" && "Type a client name and deal size to log instantly"}
              {activeNavId === "dashboard" && "Your commission performance this month"}
              {activeNavId === "history" && "Every deal you've logged in this browser"}
              {activeNavId === "settings" && "Configure your rates, goals, and packages"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAtFreeLimit && (
              <button
                className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                onClick={() => window.open(LANDING_PAGE_URL, "_blank", "noopener,noreferrer")}
              >
                Upgrade — daily limit reached
              </button>
            )}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-[11px] font-bold text-muted hover:bg-slate-200 transition-colors"
              onClick={() => setIsHushed((v) => !v)}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isHushed ? "visibility_off" : "visibility"}
              </span>
              <span>{isHushed ? "HIDDEN" : "VISIBLE"}</span>
            </button>
          </div>
        </header>

        {/* ── Onboarding overlay (fixed, covers full screen on all sizes) ─── */}
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#f9fafb]">
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-md">
                {onboardingStep === 0 ? (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <button type="button" className="flex size-10 items-center justify-start text-slate-900" onClick={completeOnboarding} aria-label="Skip">
                        <span className="material-symbols-outlined text-2xl">close</span>
                      </button>
                      <h2 className="text-slate-900 text-lg font-bold flex-1 text-center pr-10">Onboarding</h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 mb-6">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="h-3 w-24 bg-primary/20 rounded-full" />
                        <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                      </div>
                      <div className="p-4">
                        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">keyboard</span>
                            <div className="flex-1">
                              <div className="text-[10px] font-semibold text-primary uppercase tracking-[0.16em]">Quick Log</div>
                              <div className="text-lg font-semibold text-slate-900 mt-1">Nike 50k</div>
                            </div>
                            <div className="bg-primary p-2 rounded-lg text-white">
                              <span className="material-symbols-outlined text-base">add</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-4 space-y-3">
                        {[{ icon: "shopping_bag", name: "Apple Inc.", time: "2 minutes ago", amount: "$12,400" }, { icon: "store", name: "Starbucks", time: "1 hour ago", amount: "$3,200" }].map((item) => (
                          <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                                <div className="text-[11px] text-slate-500">{item.time}</div>
                              </div>
                            </div>
                            <div className="text-sm font-bold text-slate-900">{item.amount}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <h2 className="text-[22px] font-black text-slate-900 leading-tight tracking-tight mb-2">Log Deals in Seconds</h2>
                      <p className="text-sm text-slate-500 leading-relaxed">The fastest way for sales reps to track commissions. Just type and go.</p>
                    </div>

                    <div className="flex justify-center gap-2 mb-6">
                      <div className="h-1.5 w-6 rounded-full bg-primary" />
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                    </div>
                    <button type="button" className="w-full bg-primary text-white py-4 rounded-xl text-base font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-all" onClick={() => setOnboardingStep(1)}>
                      <span>Next</span><span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>

                ) : onboardingStep === 1 ? (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <button type="button" className="flex size-12 items-center justify-start text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors" onClick={() => setOnboardingStep(0)} aria-label="Back">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                      </button>
                      <button type="button" className="text-primary font-semibold px-4 py-2" onClick={completeOnboarding}>Skip</button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-slate-200">
                      <div className="p-5 border-b border-slate-100">
                        <div className="h-3 w-24 bg-slate-100 rounded mb-2" /><div className="h-6 w-40 bg-slate-200 rounded" />
                      </div>
                      <div className="p-5 flex flex-col gap-4">
                        <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-sm font-medium text-primary">Total Commission</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">$12,450.00</p>
                            </div>
                            <div className="bg-emerald-500/20 text-emerald-600 px-2 py-1 rounded text-xs font-bold">+15.4%</div>
                          </div>
                          {[{ label: "Monthly Goal", val: "82%", w: "w-[82%]" }, { label: "Sales Quota", val: "65%", w: "w-[65%] opacity-60" }].map((bar) => (
                            <div key={bar.label} className="space-y-2 mb-2">
                              <div className="flex justify-between text-xs font-semibold text-slate-500"><span>{bar.label}</span><span>{bar.val}</span></div>
                              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div className={`h-full bg-primary rounded-full ${bar.w}`} /></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <h2 className="text-slate-900 text-2xl font-bold leading-tight mb-3">Visualize Your Goals</h2>
                      <p className="text-slate-600 text-sm leading-relaxed">Monitor your monthly commission, sales quota, and daily usage at a glance.</p>
                    </div>

                    <div className="flex justify-center gap-2 mb-6">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <div className="h-1.5 w-6 rounded-full bg-primary" />
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    </div>
                    <button type="button" className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-xl transition-all shadow-lg flex items-center justify-center gap-2" onClick={() => setOnboardingStep(2)}>
                      <span>Next</span><span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </button>
                  </div>

                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <button type="button" className="flex size-12 items-center justify-start text-gray-900" onClick={() => setOnboardingStep(1)} aria-label="Back">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                      </button>
                      <h2 className="text-gray-900 text-lg font-bold flex-1 text-center pr-12">Onboarding</h2>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden mb-6">
                      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                        <span className="text-xs font-bold text-primary tracking-widest uppercase">Settings Preview</span>
                        <span className="material-symbols-outlined text-gray-400">settings</span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div><p className="text-gray-900 text-sm font-semibold">Privacy Mode</p><p className="text-gray-500 text-xs">Mask earnings in public</p></div>
                          <div className="w-10 h-6 bg-primary rounded-full relative flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto" /></div>
                        </div>
                        <div className="flex flex-col py-4">
                          <p className="text-gray-900 text-sm font-semibold mb-3">Commission Goals</p>
                          <div className="space-y-3">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-primary w-3/4 rounded-full" /></div>
                            <div className="flex justify-between text-[10px] text-gray-500 font-medium"><span>$2,450 EARNED</span><span>$3,000 GOAL</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-black text-gray-900 mb-4 leading-tight">Secure &amp; Private</h2>
                      <p className="text-sm text-gray-500 leading-relaxed">Toggle Privacy Mode to mask earnings in public. Set commission rates and presets in Settings.</p>
                    </div>

                    <div className="flex justify-center gap-2 mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      <div className="w-6 h-1.5 rounded-full bg-primary" />
                    </div>
                    <button type="button" className="w-full bg-primary text-white py-4 rounded-xl text-base font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-all" onClick={completeOnboarding}>
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Scrollable content ──────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-5 lg:px-8 xl:px-10 py-5 lg:py-8 max-w-5xl mx-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <LogTab
                    input={input}
                    setInput={setInput}
                    onKeyDown={handleKeyDown}
                    error={error}
                    isAtFreeLimit={isAtFreeLimit}
                    presets={presets}
                    addDealPreset={addDealPreset}
                    formatCurrency={formatCurrency}
                    isHushed={isHushed}
                    deals={deals}
                    setPage={goToPage}
                    isPaid={isPaid}
                    freeDailyLimit={freeDailyLimit}
                    dealsTodayCount={dealsTodayCount}
                  />
                }
              />
              <Route
                path="/today"
                element={
                  <TodayTab
                    commissionThisMonth={commissionThisMonth}
                    totalValue={totalValue}
                    goal={goal}
                    quota={quota}
                    attainmentPercent={attainmentPercent}
                    progress={progress}
                    isHushed={isHushed}
                    setIsHushed={setIsHushed}
                    isPaid={isPaid}
                    freeDailyLimit={freeDailyLimit}
                    dealsTodayCount={dealsTodayCount}
                    recentDeals={recentDeals}
                    formatCurrency={formatCurrency}
                    setPage={goToPage}
                  />
                }
              />
              <Route
                path="/history"
                element={
                  <HistoryTab
                    deals={deals}
                    formatCurrency={formatCurrency}
                    isHushed={isHushed}
                    clearDeals={clearDeals}
                  />
                }
              />
              <Route path="/settings" element={SettingsContent} />
            </Routes>
          </div>
        </main>

        {/* ── Mobile daily limit banner ───────────────────────────────────── */}
        {isAtFreeLimit && (
          <div className="lg:hidden border-t border-border bg-white px-5 py-4 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-heading">Daily limit reached</h3>
                <p className="text-[11px] text-muted mt-0.5">
                  {freeDailyLimit} free logs used. Come back tomorrow or upgrade.
                </p>
              </div>
              <button
                className="whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-content hover:bg-primary-dark transition-colors"
                onClick={() => window.open(LANDING_PAGE_URL, "_blank", "noopener,noreferrer")}
              >
                Upgrade
              </button>
            </div>
          </div>
        )}

        {/* ── Mobile bottom nav ───────────────────────────────────────────── */}
        <nav className="lg:hidden border-t border-border bg-white px-4 py-2 flex items-center justify-between text-[11px] font-medium text-heading shrink-0">
          <div className="flex w-full justify-between">
            {NAV_ITEMS.map(({ id, icon, label, title, path }) => {
              const active = activeNavId === id;
              return (
                <button
                  key={id}
                  onClick={() => navigate(path)}
                  aria-label={label}
                  title={title}
                  className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 transition-colors ${
                    active ? "text-primary" : "text-muted hover:text-primary"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[17px] ${active ? "text-primary" : "text-muted"}`}>
                    {icon}
                  </span>
                  <span className={`text-[10px] font-medium ${active ? "text-primary opacity-100" : "text-muted opacity-90"}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
