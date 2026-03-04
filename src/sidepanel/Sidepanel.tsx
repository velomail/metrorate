import { useEffect, useRef, useState } from "react";
import { GlassCard } from "../components/GlassCard";
import { LogTab } from "../components/LogTab";
import { TodayTab } from "../components/TodayTab";
import { HistoryTab } from "../components/HistoryTab";
import { useCommission } from "../hooks/useCommission";
import { LANDING_PAGE_URL, SUPPORT_PAGE_URL } from "../config/landing";

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

type Page = "dashboard" | "history" | "log" | "settings";

export function Sidepanel() {
  const {
    deals,
    presets,
    addDealFromInput,
    addDealPreset,
    addPreset,
    removePreset,
    totalCommission,
    totalValue,
    isHushed,
    setIsHushed,
    isPaid,
    setIsPaid,
    commissionRate,
    setCommissionRate,
    commissionThisMonth,
    valueThisMonth,
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

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("log");
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetValue, setNewPresetValue] = useState("");
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const presetsListRef = useRef<HTMLDivElement>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    if (isAddingPreset && presetsListRef.current) {
      const el = presetsListRef.current;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [isAddingPreset]);

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      setShowOnboarding(true);
      return;
    }

    chrome.storage.local.get(["metrorate:hasSeenOnboarding"], (result) => {
      if (!result["metrorate:hasSeenOnboarding"]) {
        setShowOnboarding(true);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      return;
    }

    chrome.storage.local.get(["metrorate:lastPage"], (result) => {
      const stored = result["metrorate:lastPage"];
      if (
        stored === "dashboard" ||
        stored === "history" ||
        stored === "log" ||
        stored === "settings"
      ) {
        setPage(stored);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      return;
    }
    chrome.storage.local.set({ "metrorate:lastPage": page });
  }, [page]);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ "metrorate:hasSeenOnboarding": true });
    }
  };

  const handleAddDeal = () => {
    if (!input.trim()) return;
    const created = addDealFromInput(input);
    if (!created) {
      setError(
        "Couldn’t read that. Try “Nike 50k” or “ACME 12,500”."
      );
      return;
    }
    setError(null);
    setInput("");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isAtFreeLimit) {
        handleAddDeal();
      }
    }
  };

  const recentDeals = deals.slice(0, 4);

  const progress =
    goal > 0 ? Math.min(100, Math.round((commissionThisMonth / goal) * 100)) : 0;

  const commissionPercent = Math.round(commissionRate * 100);

  const handleAddPreset = () => {
    const value = Number(newPresetValue.replace(/,/g, ""));
    const created = addPreset(newPresetName, value);
    if (created) {
      setNewPresetName("");
      setNewPresetValue("");
      setIsAddingPreset(false);
    }
  };

  return (
    <div className="relative flex h-full w-full max-w-[360px] flex-col overflow-hidden bg-white text-heading">
      {showOnboarding && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#f9fafb]">
          {onboardingStep === 0 ? (
            <div className="flex h-full w-full flex-col">
              {/* Top app bar */}
              <div className="flex items-center bg-transparent px-4 pt-4 pb-2 justify-between">
                <button
                  type="button"
                  className="flex size-10 items-center justify-start text-slate-900"
                  onClick={completeOnboarding}
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
                <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
                  Onboarding
                </h2>
              </div>

              {/* Mockup area */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
                <div className="w-full max-w-sm">
                  <div className="relative w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    {/* Mockup header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <div className="h-3 w-24 bg-primary/20 rounded-full" />
                      <span className="material-symbols-outlined text-primary text-xl">
                        bolt
                      </span>
                    </div>

                    {/* Quick Log card */}
                    <div className="p-4">
                      <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary">
                            keyboard
                          </span>
                          <div className="flex-1">
                            <div className="text-[10px] font-semibold text-primary uppercase tracking-[0.16em]">
                              Quick Log
                            </div>
                            <div className="text-lg font-semibold text-slate-900 mt-1">
                              Nike 50k
                            </div>
                          </div>
                          <div className="bg-primary p-2 rounded-lg text-white">
                            <span className="material-symbols-outlined text-base">
                              add
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent logs */}
                    <div className="px-4 pb-4">
                      <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                        Recent Logs
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-lg">
                                shopping_bag
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                Apple Inc.
                              </div>
                              <div className="text-[11px] text-slate-500">
                                2 minutes ago
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            $12,400
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
                              <span className="material-symbols-outlined text-slate-500 text-lg">
                                store
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                Starbucks
                              </div>
                              <div className="text-[11px] text-slate-500">
                                1 hour ago
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            $3,200
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subtle border overlay */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl border border-primary/5" />
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="px-6 pt-2 pb-1 text-center">
                <h2 className="text-[22px] font-black text-slate-900 leading-tight tracking-tight mb-2">
                  Log Deals in Seconds
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                  The fastest way for sales reps to track commissions. Just type
                  and go.
                </p>
              </div>

              {/* Dots */}
              <div className="flex w-full items-center justify-center gap-2 py-4">
                <div className="h-1.5 w-6 rounded-full bg-primary" />
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
              </div>

              {/* Primary CTA */}
              <div className="px-6 pb-6">
                <button
                  type="button"
                  className="w-full bg-primary text-white py-4 rounded-xl text-base font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
                  onClick={() => setOnboardingStep(1)}
                >
                  <span>Next</span>
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          ) : onboardingStep === 1 ? (
            <div className="flex h-full w-full flex-col">
              {/* Top nav: back + Skip */}
              <div className="flex items-center justify-between p-4 bg-transparent">
                <button
                  type="button"
                  className="flex size-12 items-center justify-start text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors"
                  onClick={() => setOnboardingStep(0)}
                >
                  <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <button
                  type="button"
                  className="text-primary font-semibold px-4 py-2"
                  onClick={completeOnboarding}
                >
                  Skip
                </button>
              </div>

              {/* Mockup + content */}
              <div className="flex flex-1 flex-col items-center justify-center px-6 pb-4 min-h-0">
                <div className="w-full max-w-sm flex flex-col flex-1 min-h-0 justify-center">
                  {/* Mockup card */}
                  <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-slate-200 flex flex-col">
                    {/* Mockup header */}
                    <div className="p-5 border-b border-slate-100">
                      <div className="h-3 w-24 bg-slate-100 rounded mb-2" />
                      <div className="h-6 w-40 bg-slate-200 rounded" />
                    </div>

                    {/* Commission card */}
                    <div className="p-5 flex flex-col gap-4">
                      <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm font-medium text-primary">Total Commission</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">$12,450.00</p>
                          </div>
                          <div className="bg-emerald-500/20 text-emerald-600 px-2 py-1 rounded text-xs font-bold">
                            +15.4%
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs font-semibold text-slate-500">
                            <span>Monthly Goal</span>
                            <span>82%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full w-[82%]" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-slate-500">
                            <span>Sales Quota</span>
                            <span>65%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60 rounded-full w-[65%]" />
                          </div>
                        </div>
                      </div>
                      {/* List item mockup */}
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                        <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
                          <span className="material-symbols-outlined text-xl">trending_up</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
                          <div className="h-2 w-16 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Onboarding text */}
                <div className="text-center max-w-md px-2">
                  <h2 className="text-slate-900 text-2xl font-bold leading-tight mb-3">
                    Visualize Your Goals
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Monitor your monthly commission, sales quota, and daily usage at a glance.
                  </p>
                </div>
              </div>

              {/* Dots */}
              <div className="flex w-full items-center justify-center gap-2 py-4">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <div className="h-1.5 w-6 rounded-full bg-primary" />
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              </div>

              {/* Next */}
              <div className="px-6 pb-6">
                <button
                  type="button"
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  onClick={() => setOnboardingStep(2)}
                >
                  <span>Next</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f9fafb]">
              {/* TopAppBar: back + title (mt-12 equivalent via top bar height) */}
              <div className="flex items-center bg-white p-4 justify-between shrink-0">
                <button
                  type="button"
                  className="flex size-12 shrink-0 items-center justify-start text-gray-900 cursor-pointer"
                  onClick={() => setOnboardingStep(1)}
                >
                  <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
                  Onboarding
                </h2>
              </div>

              {/* Mockup container: white card, rounded-2xl, shadow-xl, mb-12 */}
              <div className="px-6 pt-6 flex-1 min-h-0 flex flex-col">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden mb-12">
                  {/* Mockup header: px-4 py-3 border-b border-gray-50 */}
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">
                      Settings Preview
                    </span>
                    <span className="material-symbols-outlined text-gray-400">settings</span>
                  </div>
                  <div className="p-4">
                    {/* Privacy Toggle Row */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div className="flex flex-col">
                        <p className="text-gray-900 text-sm font-semibold">Privacy Mode</p>
                        <p className="text-gray-500 text-xs">Mask earnings in public</p>
                      </div>
                      <div className="w-10 h-6 bg-primary rounded-full relative flex items-center px-1">
                        <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                      </div>
                    </div>
                    {/* Commission Section */}
                    <div className="flex flex-col py-4">
                      <p className="text-gray-900 text-sm font-semibold mb-3">Commission Goals</p>
                      <div className="space-y-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-3/4 rounded-full" />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                          <span>$2,450 EARNED</span>
                          <span>$3,000 GOAL</span>
                        </div>
                      </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="mt-2 space-y-2">
                      <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                      <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography: 2xl black headline, sm gray-500 body, px-6 */}
              <div className="px-6 flex flex-col flex-grow">
                <h2 className="text-2xl font-black text-gray-900 text-center mb-4 leading-tight">
                  Secure &amp; Private
                </h2>
                <p className="text-sm text-gray-500 text-center leading-relaxed mb-12">
                  Toggle Privacy Mode to mask earnings in public. Set your own commission rates and presets in Settings to tailor the experience to your workflow.
                </p>
              </div>

              {/* Pagination: gap-2 mb-8; active w-6 h-1.5, inactive w-1.5 h-1.5 bg-gray-200 */}
              <div className="px-6 pb-8 flex flex-col items-center">
                <div className="flex justify-center gap-2 mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="w-6 h-1.5 rounded-full bg-primary" />
                </div>
                <button
                  type="button"
                  className="w-full bg-primary text-white py-4 rounded-xl text-base font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
                  onClick={completeOnboarding}
                >
                  Get Started
                </button>
                <div className="h-2" />
              </div>
            </div>
          )}
        </div>
      )}

      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-4 px-5">
        {page === "dashboard" && (
          <section className="pt-6 pb-6">
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
              setPage={setPage}
            />
          </section>
        )}

        {page === "history" && (
          <section className="pt-6 pb-6">
            <HistoryTab
              deals={deals}
              formatCurrency={formatCurrency}
              isHushed={isHushed}
              clearDeals={clearDeals}
            />
          </section>
        )}

        {page === "log" && (
          <section className="pt-6 pb-10">
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
              setPage={setPage}
              isPaid={isPaid}
              freeDailyLimit={freeDailyLimit}
              dealsTodayCount={dealsTodayCount}
            />
          </section>
        )}

        {page === "settings" && (
          <section className="pt-6 pb-8 space-y-7">
            <div className="space-y-3">
              <GlassCard className="p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">
                      account_circle
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-heading">Account &amp; Plan</h3>
                    <p className="text-sm text-muted">
                      {isPaid
                        ? "Unlimited logs"
                        : `Free Plan (${freeDailyLimit} logs/day). Unlock Unlimited Logs with lifetime.`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-content font-bold py-2.5 rounded-lg transition-colors text-sm"
                  onClick={() =>
                    window.open(
                      LANDING_PAGE_URL,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  {isPaid ? "Manage billing" : "Unlock Lifetime Usage"}
                </button>
                <div className="mt-3 text-center">
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
            </div>

            <div className="space-y-3">
              <GlassCard className="p-4 flex flex-col gap-4">
                <h3 className="font-bold mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">target</span>
                  Commission Goals
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                      Monthly Goal ($)
                    </label>
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
                    <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                      Monthly Quota (Revenue)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-full bg-slate-50 border border-border rounded-lg px-3 py-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      value={quota || ""}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isNaN(v) || v < 0) {
                          setQuota(0);
                          return;
                        }
                        setQuota(Math.round(v));
                      }}
                    />
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="space-y-3">
              <GlassCard className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">percent</span>
                    Rate Defaults
                  </h3>
                  <span className="text-primary font-bold text-sm">{commissionPercent}%</span>
                </div>
                <label className="block text-xs font-medium text-muted mb-2">
                  Commission Rate (%)
                </label>
                <input
                  type="range"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  min={1}
                  max={100}
                  step={1}
                  value={commissionPercent}
                  onChange={(e) =>
                    setCommissionRate(Number(e.target.value) / 100)
                  }
                />
              </GlassCard>
            </div>

            <div className="space-y-3">
              <GlassCard className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">inventory_2</span>
                    Presets &amp; Packages
                  </h3>
                  <button
                    type="button"
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:bg-primary/5 px-2 py-1 rounded transition-colors"
                    onClick={() => {
                      setIsAddingPreset(true);
                      setNewPresetName("");
                      setNewPresetValue("");
                    }}
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add New
                  </button>
                </div>
                <div
                  ref={presetsListRef}
                  className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-hide"
                >
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-0.5">
                            Package
                          </span>
                          <span className="text-sm font-semibold text-heading truncate">
                            {preset.name}
                          </span>
                        </div>
                        <div className="flex flex-col items-end shrink-0 ml-2">
                          <span className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-0.5">
                            Amount
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {formatCurrency(preset.value, isHushed)}
                          </span>
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
                      No presets yet. Click “Add New” to create your first package.
                    </p>
                  )}

                  {isAddingPreset && (
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-primary uppercase mb-1">
                            Package Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Mid-Market"
                            className="w-full bg-white border border-border rounded-md text-sm px-2 py-1.5 text-heading placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-primary uppercase mb-1">
                            Deal Amount ($)
                          </label>
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
                          onClick={() => {
                            setIsAddingPreset(false);
                            setNewPresetName("");
                            setNewPresetValue("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="pt-2 pb-2 flex items-center justify-between border-t border-border px-1">
              <div className="min-w-0 pr-4">
                <p className="text-xs font-bold text-muted uppercase tracking-tight">Privacy</p>
                <p className="text-xs text-muted leading-relaxed mt-0.5">
                  Privacy Mode hides your commission amounts from the screen, perfect for working in public.
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
        )}
      </main>

      {isAtFreeLimit && (
        <div className="border-t border-border bg-white px-5 py-5 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-5">
            <div>
              <h3 className="text-sm font-bold text-heading">
                Daily limit reached
              </h3>
              <p className="text-[11px] text-muted mt-1">
                You&apos;ve used all {freeDailyLimit} free logs for today. Your
                existing data is saved — new deals can be added again tomorrow.
              </p>
            </div>
            <button
              className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-content hover:bg-primary-dark transition-colors"
              onClick={() =>
                window.open(LANDING_PAGE_URL, "_blank", "noopener,noreferrer")
              }
            >
              Add payment
            </button>
          </div>
        </div>
      )}

      <nav className="border-t border-border bg-white px-4 py-2 flex items-center justify-between text-[11px] font-medium text-heading">
        <div className="flex w-full justify-between">
          {(["log", "dashboard", "history", "settings"] as Page[]).map((id) => {
            const icons: Record<Page, string> = {
              dashboard: "event",
              history: "history",
              log: "edit_square",
              settings: "settings"
            };
            const labels: Record<Page, string> = {
              dashboard: "Today",
              history: "History",
              log: "Log",
              settings: "Settings"
            };
            const titles: Record<Page, string> = {
              dashboard: "Today’s overview",
              history: "Deal history",
              log: "Log a new deal",
              settings: "Settings"
            };
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                aria-label={labels[id]}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 ${
                  active ? "text-primary" : "text-muted hover:text-primary"
                }`}
                title={titles[id]}
              >
                <span
                  className={`material-symbols-outlined text-[17px] ${
                    active ? "text-primary" : "text-muted"
                  }`}
                >
                  {icons[id]}
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    active ? "text-primary opacity-100" : "text-muted opacity-90"
                  }`}
                >
                  {labels[id]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

