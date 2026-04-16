import React from "react";
import { GlassCard } from "./GlassCard";
import type { Deal, ProductPreset } from "../hooks/useCommission";

export type LogTabProps = {
  input: string;
  setInput: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  error: string | null;
  isAtFreeLimit: boolean;
  presets: ProductPreset[];
  addDealPreset: (name: string, value: number) => void;
  formatCurrency: (value: number, isHushed: boolean) => React.ReactNode;
  isHushed: boolean;
  deals: Deal[];
  setPage: (page: "log" | "dashboard" | "history" | "settings") => void;
  isPaid: boolean;
  freeDailyLimit: number;
  dealsTodayCount: number;
};

export const LogTab: React.FC<LogTabProps> = ({
  input,
  setInput,
  onKeyDown,
  error,
  isAtFreeLimit,
  presets,
  addDealPreset,
  formatCurrency,
  isHushed,
  deals,
  setPage,
  isPaid,
  freeDailyLimit,
  dealsTodayCount
}) => {
  return (
    // Two-column grid on desktop: left = input + recent logs, right = presets
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 lg:items-start gap-6">

      {/* ── Left column: Log input + Recent logs ────────────────────── */}
      <div className="space-y-6">
        <GlassCard className="bg-primary/5 border-primary/20 p-5 lg:p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-heading text-base font-semibold mb-1">Quick Log</h2>
            <p className="text-[11px] text-muted leading-relaxed">
              Type{" "}
              <span className="font-mono bg-slate-100 text-heading px-1 py-0.5 rounded text-[10px]">
                Client Amount
              </span>{" "}
              — e.g.{" "}
              <span className="font-mono bg-primary/10 text-primary px-1 py-0.5 rounded text-[10px]">
                Nike 50k
              </span>{" "}
              — then press Enter.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Nike 50k or ACME 12,500"
                className="flex-1 h-12 px-4 rounded-xl border border-border bg-white text-heading placeholder:text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[13px] shadow-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={isAtFreeLimit}
                autoFocus
              />
              <button
                type="button"
                className="h-12 px-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                onClick={() => {
                  if (!isAtFreeLimit) {
                    const event = { key: "Enter", preventDefault: () => {} } as React.KeyboardEvent<HTMLInputElement>;
                    onKeyDown(event);
                  }
                }}
                disabled={isAtFreeLimit || !input.trim()}
                aria-label="Log deal"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>

            {error && (
              <p className="msg-bubble msg-bubble-error text-xs" role="alert">
                {error}
              </p>
            )}
            {isAtFreeLimit && (
              <p className="msg-bubble msg-bubble-warning text-xs">
                Limited to {freeDailyLimit} free logs per day. You&apos;ve logged {dealsTodayCount} today.
              </p>
            )}
            {!isPaid && !isAtFreeLimit && (
              <div className="flex justify-between items-center text-[10px] text-muted px-1">
                <span>{Math.max(freeDailyLimit - dealsTodayCount, 0)} free logs remaining today</span>
                <button
                  type="button"
                  className="text-primary font-semibold hover:underline"
                  onClick={() => setPage("settings")}
                >
                  Unlock unlimited
                </button>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Recent logs */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wide">
              Recent Logs
            </h3>
            {deals.length > 0 && (
              <button
                type="button"
                className="text-[11px] font-semibold text-muted hover:text-primary transition-colors"
                onClick={() => setPage("history")}
              >
                View all
              </button>
            )}
          </div>
          <div className="space-y-2">
            {deals.length === 0 ? (
              <p className="text-[11px] text-muted msg-bubble msg-bubble-info">
                No logs yet. Log your first deal above to see it here.
              </p>
            ) : (
              deals.slice(0, 3).map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white border border-border rounded-xl p-3 flex items-center justify-between shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-heading truncate">{deal.name}</p>
                      <p className="text-[10px] text-muted">
                        {new Date(deal.createdAt).toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary shrink-0 ml-2">
                    {formatCurrency(deal.commission, isHushed)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Right column: Presets ────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wide">
            Presets &amp; Packages
          </h3>
          <button
            type="button"
            className="text-[11px] font-semibold text-primary hover:underline transition-colors"
            onClick={() => setPage("settings")}
          >
            Manage
          </button>
        </div>

        <div className="space-y-2">
          {presets.length === 0 ? (
            <p className="text-[11px] text-muted msg-bubble msg-bubble-info">
              No presets yet. Add packages from Settings to log deals even faster.
            </p>
          ) : (
            // Responsive preset grid: 1-col mobile, 2-col on md+ within left col (single col on lg since already in 2-col grid)
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
              {presets.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  className="flex justify-between items-center p-4 bg-white border border-border rounded-xl hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-md transition-all shadow-sm disabled:opacity-60 text-left group"
                  onClick={() => {
                    if (isAtFreeLimit) return;
                    addDealPreset(pkg.name, pkg.value);
                  }}
                  disabled={isAtFreeLimit}
                >
                  <div className="min-w-0 mr-3">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wide block mb-0.5">Package</span>
                    <span className="text-sm font-semibold text-heading truncate block group-hover:text-primary transition-colors">{pkg.name}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wide block mb-0.5">Deal Value</span>
                    <span className="text-sm font-bold text-primary">{formatCurrency(pkg.value, isHushed)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className="w-full py-3 border-2 border-dashed border-border rounded-xl text-primary font-medium text-sm hover:bg-primary/5 hover:border-primary/40 transition-all"
            onClick={() => setPage("settings")}
          >
            + Add New Package
          </button>
        </div>
      </section>
    </div>
  );
};
