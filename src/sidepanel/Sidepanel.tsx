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
        <div className="absolute inset-0 z-30 flex flex-col bg-white dark:bg-background-dark/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[11px] text-muted">
            <span>Welcome to MetroRate</span>
            <button
              className="text-[10px] text-muted hover:text-primary underline decoration-dotted transition-colors"
              onClick={completeOnboarding}
            >
              Skip
            </button>
          </div>

          <div className="flex-1 min-h-0 flex flex-col justify-center px-5 py-6 overflow-y-auto">
            {onboardingStep === 0 && (
              <GlassCard className="p-6 sm:p-8 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#dbeafe] flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-primary">trending_up</span>
                </div>
                <h2 className="text-lg font-semibold text-heading">
                  See your commission at a glance
                </h2>
                <p className="text-sm text-muted">
                  MetroRate lives in your browser side panel so you always see
                  your commission next to your pipeline.
                </p>
                <p className="text-sm text-muted">
                  Add a deal like <span className="font-mono text-heading">Nike 50k</span>{" "}
                  and MetroRate instantly calculates the commission for you.
                </p>
              </GlassCard>
            )}

            {onboardingStep === 1 && (
              <GlassCard className="p-6 sm:p-8 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#dbeafe] flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-primary">checklist</span>
                </div>
                <h2 className="text-lg font-semibold text-heading">
                  How MetroRate works
                </h2>
                <p className="text-sm text-muted">
                  <span className="font-semibold text-heading">1.</span> Add a deal in the
                  Log deal tab (e.g.{" "}
                  <span className="font-mono text-heading">Nike 50k</span>).
                </p>
                <p className="text-sm text-muted">
                  <span className="font-semibold text-heading">2.</span> MetroRate applies
                  your commission rate and tracks volume and earnings.
                </p>
                <p className="text-sm text-muted">
                  <span className="font-semibold text-heading">3.</span> Watch your goal and
                  daily-usage bars move on the Dashboard.
                </p>
                <button
                  type="button"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-heading bg-white hover:border-primary hover:text-primary transition-colors"
                  onClick={() => {
                    completeOnboarding();
                    setPage("log");
                  }}
                >
                  Try it
                </button>
              </GlassCard>
            )}

            {onboardingStep === 2 && (
              <GlassCard className="p-6 sm:p-8 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#dbeafe] flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-primary">verified_user</span>
                </div>
                <h2 className="text-lg font-semibold text-heading">
                  Free plan, upgrade &amp; privacy
                </h2>
                <p className="text-sm text-muted">
                  MetroRate gives you {freeDailyLimit} free logs per day. When
                  you hit the limit, your data remains visible and you can add
                  more deals tomorrow.
                </p>
                <p className="text-sm text-muted">
                  Your deals are stored in Chrome storage only — nothing leaves
                  your browser without your consent.
                </p>
                <button
                  type="button"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-heading bg-white hover:border-primary hover:text-primary transition-colors"
                  onClick={() =>
                    window.open(LANDING_PAGE_URL, "_blank", "noopener,noreferrer")
                  }
                >
                  Add payment
                </button>
              </GlassCard>
            )}
          </div>

          <div className="pb-4 px-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">
                Step {onboardingStep + 1} of 3
              </span>
              <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={`rounded-full transition-all ${
                    onboardingStep === i
                      ? "w-5 h-2 bg-primary"
                      : "w-2 h-2 bg-border"
                  }`}
                  onClick={() => setOnboardingStep(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
              </div>
            </div>
            <div className="flex gap-2">
              {onboardingStep > 0 && (
                <button
                  className="rounded-lg border border-border px-3 py-1 text-[11px] text-heading hover:border-primary hover:text-primary transition-colors"
                  onClick={() => setOnboardingStep((s) => Math.max(0, s - 1))}
                >
                  Back
                </button>
              )}
              {onboardingStep < 2 ? (
                <button
                  className="rounded-lg bg-primary px-3 py-1 text-[11px] font-semibold text-primary-content hover:bg-primary-dark transition-colors"
                  onClick={() => setOnboardingStep((s) => Math.min(2, s + 1))}
                >
                  Next
                </button>
              ) : (
                <button
                  className="rounded-lg bg-primary px-3 py-1 text-[11px] font-semibold text-primary-content hover:bg-primary-dark transition-colors"
                  onClick={completeOnboarding}
                >
                  Get started
                </button>
              )}
            </div>
          </div>
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

