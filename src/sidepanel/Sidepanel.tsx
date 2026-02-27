import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { useCommission } from "../hooks/useCommission";

const LANDING_PAGE_URL = "https://your-metrorate-landing-page.com";

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

  const handleAddSampleDeal = () => {
    if (isAtFreeLimit) return;
    addDealFromInput("Sample client 10k");
    setPage("log");
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

  const GOAL = 650;
  const progress =
    GOAL > 0 ? Math.min(100, Math.round((totalCommission / GOAL) * 100)) : 0;

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
    <div className="relative flex h-full w-full max-w-[360px] flex-col overflow-hidden bg-white text-black">
      {showOnboarding && (
        <div className="absolute inset-0 z-30 flex flex-col bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[11px] text-slate-400">
            <span>Welcome to MetroRate</span>
            <button
              className="text-[10px] underline decoration-dotted"
              onClick={completeOnboarding}
            >
              Skip
            </button>
          </div>

          <div className="flex-1 px-5 pb-4 flex flex-col justify-center gap-4">
            {onboardingStep === 0 && (
              <GlassCard className="p-5 flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  See your commission at a glance
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  MetroRate lives in your browser side panel so you always see
                  your commission next to your pipeline.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add a deal like <span className="font-mono">Nike 50k</span>{" "}
                  and MetroRate instantly calculates the commission for you.
                </p>
              </GlassCard>
            )}

            {onboardingStep === 1 && (
              <GlassCard className="p-5 flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  How MetroRate works
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">1.</span> Add a deal in the
                  Calculator tab (e.g.{" "}
                  <span className="font-mono">Nike 50k</span>).
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">2.</span> MetroRate applies
                  your commission rate and tracks volume and earnings.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">3.</span> Watch your goal and
                  daily-usage bars move on the Dashboard.
                </p>
              </GlassCard>
            )}

            {onboardingStep === 2 && (
              <GlassCard className="p-5 flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Free plan &amp; privacy
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  MetroRate gives you {freeDailyLimit} free logs per day. When
                  you hit the limit, your data remains visible and you can add
                  more deals tomorrow.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your deals are stored in Chrome storage only — nothing leaves
                  your browser without your consent.
                </p>
                <button
                  className="mt-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-content shadow-sm"
                  onClick={() =>
                    window.open(LANDING_PAGE_URL, "_blank", "noopener,noreferrer")
                  }
                >
                  View plans &amp; FAQs
                </button>
              </GlassCard>
            )}
          </div>

          <div className="pb-4 px-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Step {onboardingStep + 1} of 3
              </span>
              <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    onboardingStep === i
                      ? "w-4 bg-primary"
                      : "w-2 bg-slate-500/40"
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
                  className="rounded-full border border-surface-variant/70 dark:border-surface-variant-dark/70 px-3 py-1 text-[11px] text-slate-600 dark:text-slate-200"
                  onClick={() => setOnboardingStep((s) => Math.max(0, s - 1))}
                >
                  Back
                </button>
              )}
              {onboardingStep < 2 ? (
                <button
                  className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-content"
                  onClick={() => setOnboardingStep((s) => Math.min(2, s + 1))}
                >
                  Next
                </button>
              ) : (
                <button
                  className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-content"
                  onClick={completeOnboarding}
                >
                  Get started
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <nav className="px-3 pt-2 pb-2 flex items-center justify-between text-[11px] font-medium text-slate-700">
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
                    ? "border-black text-black"
                    : "border-transparent text-slate-500 hover:text-black"
                }`}
                title={titles[id]}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="material-symbols-outlined text-base">
                    {icons[id]}
                  </span>
                  <span
                    className={`text-[10px] font-medium ${
                      active ? "opacity-100" : "opacity-80"
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

      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-24">
        {page === "dashboard" && (
          <>
            <section className="px-5 pt-4 pb-2">
              <GlassCard className="relative overflow-hidden p-5 border border-black">
                <h2 className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Total commission
                </h2>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                    {formatCurrency(totalCommission, isHushed)}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    From {deals.length} logged deal
                    {deals.length === 1 ? "" : "s"} in MetroRate.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-2 border-t border-black pt-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Pipeline: {formatCurrency(totalValue, isHushed)}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {progress}% of $650 goal
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-none bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
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
                  <div className="h-2 w-full rounded-none bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-500 ease-out"
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

            <section className="px-5 py-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">
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
              <div className="flex flex-col gap-4">
                {recentDeals.length === 0 && (
                  <div className="flex items-center justify-between border border-dashed border-black px-3 py-2.5 bg-white">
                    <div className="flex flex-col">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        See your pipeline and commission fill up instantly.
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        Add a sample deal to see how MetroRate works. You can
                        remove it later.
                      </p>
                    </div>
              <button
                className="ml-3 bg-black px-3 py-1.5 text-[11px] font-semibold text-white border border-black disabled:opacity-50 hover:bg-white hover:text-black transition-colors"
                      onClick={handleAddSampleDeal}
                      disabled={isAtFreeLimit}
                    >
                      Add sample
                    </button>
                  </div>
                )}
                {recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between border-b border-slate-200 pb-2 last:border-b-0"
                  >
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                        {deal.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
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
          <section className="px-5 pt-6 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-slate-900 dark:text-slate-100 text-sm font-semibold">
                  Sales history
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Every deal you log in MetroRate appears here. Data is stored
                  locally in this browser.
                </p>
              </div>
              {deals.length > 0 && (
                <button
                  className="border border-black px-3 py-1 text-[10px] text-slate-700 bg-white"
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
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You haven&apos;t logged any deals yet. Add a deal from the
                Calculator or Quick-add tab to start building your history.
              </p>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {deals.map((deal) => {
                  const created = new Date(deal.createdAt);
                  return (
                    <div
                      key={deal.id}
                      className="flex items-start justify-between border border-slate-300 px-3 py-2 bg-white"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {deal.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {created.toLocaleDateString()} ·{" "}
                          {formatCurrency(deal.value, isHushed)} value
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(deal.commission, isHushed)}
                        </span>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
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
          <section className="px-5 pt-6 space-y-4">
            <div>
              <h2 className="text-slate-900 dark:text-slate-100 text-sm font-semibold mb-1">
                Log a deal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type a deal like <span className="font-mono">Nike 50k</span>.
                MetroRate applies your {commissionPercent}% commission rate.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 border-b-2 border-black bg-white px-3 py-2 text-sm text-black placeholder:text-slate-500 focus:outline-none focus:border-b-4 disabled:opacity-50"
                placeholder='Add deal e.g. "Nike 50k"'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAtFreeLimit}
              />
              <button
                className="bg-black px-4 py-2 text-xs font-semibold text-white border border-black disabled:opacity-50 hover:bg-white hover:text-black transition-colors"
                onClick={handleAddDeal}
                disabled={isAtFreeLimit}
              >
                Add
              </button>
            </div>
            {error && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                {error}
              </p>
            )}
            {isAtFreeLimit && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Limited to {freeDailyLimit} free logs per day. You&apos;ve
                logged {dealsTodayCount} today. Come back tomorrow for more.
              </p>
            )}
            {presets.length > 0 && (
              <div className="pt-2 space-y-2">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Templates
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      className="flex items-center justify-between px-3 py-2 text-left border border-slate-300 bg-white disabled:opacity-50"
                      onClick={() => {
                        if (isAtFreeLimit) return;
                        addDealPreset(preset.name, preset.value);
                      }}
                      disabled={isAtFreeLimit}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900">
                          {preset.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {formatCurrency(preset.value, isHushed)}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-base text-black">
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
          <section className="px-5 pt-6 pb-4 space-y-4">
            <div className="space-y-2">
              <h2 className="text-slate-900 text-sm font-semibold">
                Account &amp; plan
              </h2>
              <GlassCard className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700">
                      {isPaid ? "Unlimited plan" : "Free plan"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isPaid
                        ? "Log unlimited deals per day."
                        : `Log up to ${freeDailyLimit} deals per day. Perfect for trying MetroRate.`}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800">
                    {isPaid
                      ? "Unlimited"
                      : `${dealsTodayCount}/${freeDailyLimit} used`}
                  </span>
                </div>
                <div className="h-2 w-full rounded-none bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-black"
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
                <p className="text-[11px] text-slate-500">
                  {isPaid
                    ? "Unlimited access is active in this browser profile."
                    : "Need more? Upgrade on the website to unlock unlimited logs."}
                </p>
                <div className="flex justify-between gap-2">
                  <button
                    className="px-3 py-1 text-[11px] font-semibold bg-black text-white border border-black hover:bg-white hover:text-black transition-colors"
                    onClick={() =>
                      window.open(
                        LANDING_PAGE_URL,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    View plans &amp; pricing
                  </button>
                  <button
                    className="px-3 py-1 text-[11px] font-semibold border border-black text-slate-700 bg-white hover:bg-black hover:text-white transition-colors"
                    onClick={() => setIsPaid(true)}
                  >
                    I&apos;ve upgraded
                  </button>
                </div>
              </GlassCard>
            </div>

            <div className="space-y-2">
              <h2 className="text-slate-900 text-sm font-semibold">
                Commission defaults
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Commission
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Default rate for new deals (1–100%).
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-800">
                  {commissionPercent}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={commissionPercent}
                onChange={(e) =>
                  setCommissionRate(Number(e.target.value) / 100)
                }
                className="w-full accent-black"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-slate-900 text-sm font-semibold">
                Presets &amp; shortcuts
              </h2>
              <div className="flex items-center justify-between">
                <h2 className="text-slate-900 text-sm font-semibold">
                  Saved deal templates
                </h2>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Product name"
                  className="flex-1 border border-slate-300 bg-white px-2 py-1.5 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Amount"
                  className="w-24 border border-slate-300 bg-white px-2 py-1.5 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  value={newPresetValue}
                  onChange={(e) => setNewPresetValue(e.target.value)}
                />
                <button
                  className="bg-black px-3 py-1.5 text-[11px] font-semibold text-white border border-black disabled:opacity-50 hover:bg-white hover:text-black transition-colors"
                  onClick={handleAddPreset}
                  disabled={!newPresetName.trim() || !newPresetValue.trim()}
                >
                  Add
                </button>
              </div>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between border border-slate-300 bg-white px-2 py-1.5 text-[11px]"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">
                        {preset.name}
                      </span>
                      <span className="text-slate-500">
                        {formatCurrency(preset.value, isHushed)}
                      </span>
                    </div>
                    <button
                      className="text-[10px] text-slate-500 hover:text-black"
                      onClick={() => removePreset(preset.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {presets.length === 0 && (
                  <p className="text-[11px] text-slate-500">
                    No products yet. Add one above to power Simple View.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-slate-900 text-sm font-semibold">
                Privacy
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Visibility
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Blur commission amounts when you need privacy.
                  </span>
                </div>
                <button
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs border border-black bg-white text-slate-700 hover:bg-black hover:text-white transition-colors"
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
              <p className="text-[11px] text-slate-500">
                Your data stays in Chrome storage; nothing is sent to our servers.
              </p>
            </div>
          </section>
        )}
      </main>

      {isAtFreeLimit && (
        <div className="absolute bottom-0 left-0 w-full z-20 border-t border-black bg-white px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daily limit reached
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                You&apos;ve used all {freeDailyLimit} free logs for today. Your
                existing data is saved — new deals can be added again tomorrow.
              </p>
            </div>
            <button
              className="whitespace-nowrap bg-black px-4 py-2 text-xs font-semibold text-white border border-black hover:bg-white hover:text-black transition-colors"
              onClick={() =>
                window.open(LANDING_PAGE_URL, "_blank", "noopener,noreferrer")
              }
            >
              View plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

