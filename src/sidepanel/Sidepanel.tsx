import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { useCommission } from "../hooks/useCommission";
import { LANDING_PAGE_URL } from "../config/landing";

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
    freeDailyLimit
  } = useCommission();

  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetValue, setNewPresetValue] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

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
      <nav className="px-5 pt-3 pb-3 flex items-center justify-between text-[11px] font-medium text-heading border-b border-border">
        <div className="flex gap-1 flex-1">
          {(["dashboard", "history", "log", "settings"] as Page[]).map((id) => {
            const icons: Record<Page, string> = {
              dashboard: "dashboard",
              history: "history",
              log: "edit_square",
              settings: "tune"
            };
            const labels: Record<Page, string> = {
              dashboard: "Today",
              history: "History",
              log: "Log deal",
              settings: "Settings"
            };
            const titles: Record<Page, string> = {
              dashboard: "Today’s overview",
              history: "Sales history",
              log: "Log a new deal",
              settings: "User settings"
            };
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                aria-label={labels[id]}
                className={`flex-1 flex flex-col items-center justify-center px-1 py-1.5 border-b-2 ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-primary"
                }`}
                title={titles[id]}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className={`material-symbols-outlined text-base ${
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
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-24 px-5">
        {page === "dashboard" && (
          <>
            <section className="pt-6 pb-2">
              <GlassCard className="relative overflow-hidden p-5">
                <h2 className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                  Total commission
                </h2>
                <div className="flex flex-col gap-2.5">
                  <span className="text-3xl font-bold text-heading">
                    {formatCurrency(totalCommission, isHushed)}
                  </span>
                  <p className="text-muted text-sm">
                    From {deals.length} logged deal
                    {deals.length === 1 ? "" : "s"} in MetroRate.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-heading">
                      Pipeline: {formatCurrency(totalValue, isHushed)}
                    </span>
                    <span className="text-xs font-bold text-heading">
                      {progress}% of {formatCurrency(goal, false)} commission goal
                    </span>
                  </div>
                  <p className="text-[11px] text-muted -mt-1">
                    Monthly commission goal — resets at the start of each month.
                  </p>
                  {quota > 0 && attainmentPercent !== null && (
                    <p className="text-[11px] text-muted">
                      Quota: {formatCurrency(quota, false)} · Attainment this month:{" "}
                      {attainmentPercent}%
                    </p>
                  )}
                  <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2.5">
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>
                      {isPaid
                        ? "Unlimited logs active"
                        : `Today: ${dealsTodayCount}/${freeDailyLimit} logs used`}
                    </span>
                    {!isPaid && (
                      <span>
                        {freeDailyLimit - dealsTodayCount > 0
                          ? `${freeDailyLimit - dealsTodayCount} left`
                          : "Limit reached"}
                      </span>
                    )}
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{
                        width: `${
                          isPaid
                            ? 100
                            : Math.min(
                                100,
                                Math.round(
                                  (dealsTodayCount / freeDailyLimit) * 100
                                )
                              )
                        }%`
                      }}
                    />
                  </div>
                </div>
              </GlassCard>
            </section>

            <section className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-heading text-lg font-bold">
                  Recent deals
                </h3>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors"
                  onClick={() => setPage("history")}
                >
                  Open history
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {recentDeals.length === 0 && (
                  <p className="text-[11px] text-muted msg-bubble msg-bubble-info py-3">
                    No deals yet. Log a deal from the Log deal tab.
                  </p>
                )}
                {recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold text-heading leading-tight">
                        {deal.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-heading">
                        {formatCurrency(deal.commission, isHushed)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {page === "history" && (
          <section className="pt-6 pb-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="text-heading text-base font-semibold">
                  Sales history
                </h2>
                <p className="text-[11px] text-muted">
                  Every deal you log in MetroRate appears here. Data is stored
                  locally in this browser.
                </p>
              </div>
              {deals.length > 0 && (
                <button
                  className="rounded-lg border border-border px-3 py-1 text-[10px] text-heading bg-white hover:border-primary hover:text-primary transition-colors"
                  onClick={() => {
                    if (window.confirm("Clear all saved deals from this browser?")) {
                      // clearDeals is available via useCommission
                      // but not currently destructured; this button is a placeholder
                    }
                  }}
                  disabled
                  title="Clear all deals (wire clearDeals when ready)"
                >
                  Clear all
                </button>
              )}
            </div>
            {deals.length === 0 ? (
              <p className="text-xs text-muted msg-bubble msg-bubble-info">
                You haven&apos;t logged any deals yet. Add a deal from the Log
                deal tab to start building your history.
              </p>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {deals.map((deal) => {
                  const created = new Date(deal.createdAt);
                  return (
                    <div
                      key={deal.id}
                      className="flex items-start justify-between border border-border rounded-xl px-4 py-3 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-heading">
                          {deal.name}
                        </span>
                        <span className="text-[11px] text-muted">
                          {created.toLocaleDateString()} ·{" "}
                          {formatCurrency(deal.value, isHushed)} value
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-heading">
                          {formatCurrency(deal.commission, isHushed)}
                        </span>
                        <div className="text-[10px] text-muted">
                          Commission
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {page === "log" && (
          <section className="pt-6 pb-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-heading text-base font-semibold">
                Log a deal
              </h2>
              <p className="text-xs text-muted">
                Type a deal like <span className="font-mono text-heading">Nike 50k</span>.
                MetroRate applies your {commissionPercent}% commission rate.
              </p>
            </div>
            <div>
              <input
                type="text"
                className="w-full border border-border rounded-lg bg-white px-3 py-2 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                placeholder='Add deal e.g. "Nike 50k"'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAtFreeLimit}
              />
            </div>
            {error && (
              <p className="mt-1 msg-bubble msg-bubble-error" role="alert">
                {error}
              </p>
            )}
            {isAtFreeLimit && (
              <p className="mt-2 msg-bubble msg-bubble-warning">
                Limited to {freeDailyLimit} free logs per day. You&apos;ve
                logged {dealsTodayCount} today. Come back tomorrow for more.
              </p>
            )}
            {presets.length > 0 && (
              <div className="pt-4 space-y-3">
                <h3 className="text-xs font-semibold text-heading uppercase tracking-wide">
                  Templates
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      className="flex items-center justify-between px-4 py-3 text-left border border-border rounded-lg bg-white disabled:opacity-50 hover:border-primary transition-colors"
                      onClick={() => {
                        if (isAtFreeLimit) return;
                        addDealPreset(preset.name, preset.value);
                      }}
                      disabled={isAtFreeLimit}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-heading">
                          {preset.name}
                        </span>
                        <span className="text-[11px] text-muted">
                          {formatCurrency(preset.value, isHushed)}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-base text-primary">
                        add
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {page === "settings" && (
          <section className="pt-6 pb-8 space-y-7">
            <div className="space-y-3">
              <h2 className="text-heading text-base font-semibold">
                Account &amp; plan
              </h2>
              <GlassCard className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-heading">
                      {isPaid ? "Unlimited (one-time)" : "Free plan"}
                    </span>
                    <span className="text-[11px] text-muted">
                      {isPaid
                        ? "Log unlimited deals per day — lifetime access."
                        : `Log up to ${freeDailyLimit} deals per day. Perfect for trying MetroRate.`}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-heading">
                    {isPaid
                      ? "Unlimited"
                      : `${dealsTodayCount}/${freeDailyLimit} used`}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${
                        isPaid
                          ? 100
                          : Math.min(
                              100,
                              Math.round(
                                (dealsTodayCount / freeDailyLimit) * 100
                              )
                            )
                      }%`
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted">
                  {isPaid
                    ? "Unlimited access is active in this browser (one-time purchase)."
                    : "Unlock unlimited logs with a one-time payment."}
                </p>
                <div className="flex justify-between gap-3 pt-1">
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-[11px] font-semibold border border-border text-heading bg-white hover:border-primary hover:text-primary transition-colors"
                    onClick={() =>
                      window.open(
                        LANDING_PAGE_URL,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Add payment
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-[11px] font-semibold border border-border text-heading bg-white hover:border-primary hover:text-primary transition-colors"
                    onClick={() => setIsPaid(true)}
                  >
                    I already paid
                  </button>
                </div>
              </GlassCard>
            </div>

            <div className="space-y-3">
              <h2 className="text-heading text-base font-semibold">
                Commission goal
              </h2>
              <p className="text-[11px] text-muted -mt-1">
                Monthly target. Progress resets at the start of each month.
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wide">
                    Goal amount
                  </span>
                  <span className="text-[11px] text-muted">
                    Target commission for the current month.
                  </span>
                </div>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="w-20 border border-border rounded-lg bg-white px-3 py-2 text-xs text-heading text-right focus:outline-none focus:ring-2 focus:ring-primary"
                  value={goal}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v) && v > 0) setGoal(Math.round(v));
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-heading text-base font-semibold">
                Quota (optional)
              </h2>
              <p className="text-[11px] text-muted -mt-1">
                Monthly revenue target used to calculate attainment %.
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wide">
                    Quota amount
                  </span>
                  <span className="text-[11px] text-muted">
                    Revenue target for the current month.
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="w-20 border border-border rounded-lg bg-white px-3 py-2 text-xs text-heading text-right focus:outline-none focus:ring-2 focus:ring-primary"
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

            <div className="space-y-3">
              <h2 className="text-heading text-base font-semibold">
                Commission defaults
              </h2>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wide">
                    Commission
                  </span>
                  <span className="text-[11px] text-muted">
                    Default rate for new deals (1–100%).
                  </span>
                </div>
                <span className="text-xs font-semibold text-heading shrink-0">
                  {commissionPercent}%
                </span>
              </div>
              <input
                type="range"
                className="mt-2 w-full accent-primary"
                min={1}
                max={100}
                step={1}
                value={commissionPercent}
                onChange={(e) =>
                  setCommissionRate(Number(e.target.value) / 100)
                }
              />
            </div>

            <div className="space-y-3">
              <h2 className="text-heading text-base font-semibold">
                Presets &amp; shortcuts
              </h2>
              <GlassCard className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wide">
                    Saved deal templates
                  </span>
                  <span className="text-[11px] text-muted">
                    Add templates to log deals faster from the Log deal tab.
                  </span>
                </div>
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1 scrollbar-hide">
                  <div className="flex items-center justify-between gap-2 border border-border rounded-lg bg-white px-3 py-2 text-[11px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                    <input
                      type="text"
                      placeholder="Product name"
                      className="flex-1 min-w-0 border-0 bg-transparent px-0 py-0 text-[11px] text-heading placeholder:text-muted focus:outline-none focus:ring-0"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="Amount"
                      className="w-20 min-w-0 border-0 bg-transparent px-0 py-0 text-right text-[11px] text-heading placeholder:text-muted focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={newPresetValue}
                      onChange={(e) => setNewPresetValue(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-content hover:bg-primary-dark transition-colors shrink-0 disabled:opacity-50"
                      onClick={handleAddPreset}
                      disabled={!newPresetName.trim() || !newPresetValue.trim()}
                    >
                      Add
                    </button>
                  </div>
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between border border-border rounded-lg bg-white px-3 py-2 text-[11px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-heading truncate">
                          {preset.name}
                        </span>
                        <span className="text-muted">
                          {formatCurrency(preset.value, isHushed)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-[10px] text-muted hover:text-primary transition-colors shrink-0 ml-2"
                        onClick={() => removePreset(preset.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {presets.length === 0 && (
                    <p className="text-[11px] text-muted msg-bubble msg-bubble-info">
                      No templates yet. Add one above to reuse for quick logging.
                    </p>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="space-y-3">
              <h2 className="text-heading text-base font-semibold">
                Privacy
              </h2>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wide">
                    Visibility
                  </span>
                  <span className="text-[11px] text-muted">
                    Blur commission amounts when you need privacy.
                  </span>
                </div>
                <button
                  className="rounded-lg inline-flex items-center gap-1 px-3 py-1 text-xs border border-border bg-white text-heading hover:border-primary hover:text-primary transition-colors"
                  onClick={() => setIsHushed((v) => !v)}
                >
                  {isHushed ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      <span>Hushed</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      <span>Visible</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted mt-1">
                Your data stays in Chrome storage; nothing is sent to our servers.
              </p>
            </div>
          </section>
        )}
      </main>

      {isAtFreeLimit && (
        <div className="absolute bottom-0 left-0 w-full z-20 border-t border-border bg-white px-5 py-5 shadow-[0_-1px_3px_rgba(0,0,0,0.08)]">
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
    </div>
  );
}

