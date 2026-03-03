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
    <div className="space-y-6">
      <GlassCard className="bg-primary/10 border-primary/20 p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-heading text-base font-semibold mb-2">Log Deal</h2>
          <p className="text-[11px] text-muted leading-relaxed">
            Type <span className="font-mono text-heading">Client Amount</span> (e.g.,{" "}
            <span className="font-mono text-heading">Nike 50k</span>) and press Enter to quickly log
            a new deal.
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter deal details..."
            className="w-full h-12 px-4 rounded-xl border border-border bg-white text-heading placeholder:text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[13px] shadow-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isAtFreeLimit}
          />

          {error && (
            <p className="msg-bubble msg-bubble-error text-xs" role="alert">
              {error}
            </p>
          )}
          {isAtFreeLimit && (
            <p className="msg-bubble msg-bubble-warning text-xs">
              Limited to {freeDailyLimit} free logs per day. You&apos;ve logged {dealsTodayCount}{" "}
              today. Come back tomorrow for more.
            </p>
          )}

          {!isPaid && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                className="text-xs font-semibold text-primary uppercase tracking-wider hover:underline"
                onClick={() => setPage("settings")}
              >
                Unlock Unlimited Logs
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      <section className="space-y-3">
        <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wide px-1">
          Presets &amp; Packages
        </h3>
        <div className="space-y-2">
          {presets.length === 0 ? (
            <p className="text-[11px] text-muted msg-bubble msg-bubble-info">
              No presets yet. Add packages from Settings to log deals even faster.
            </p>
          ) : (
            presets.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                className="w-full flex justify-between items-center p-3 bg-white border border-border rounded-xl hover:border-primary/30 transition-colors shadow-sm disabled:opacity-60"
                onClick={() => {
                  if (isAtFreeLimit) return;
                  addDealPreset(pkg.name, pkg.value);
                }}
                disabled={isAtFreeLimit}
              >
                <span className="text-xs font-medium text-muted uppercase">{pkg.name}</span>
                <span className="text-sm font-semibold text-primary">
                  {formatCurrency(pkg.value, isHushed)}
                </span>
              </button>
            ))
          )}
          <button
            type="button"
            className="w-full py-3 border-2 border-dashed border-border rounded-xl text-primary font-medium text-sm hover:bg-slate-50 transition-colors"
            onClick={() => setPage("settings")}
          >
            + Add New
          </button>
        </div>
      </section>

      <section className="space-y-3 pt-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wide">
            Recent Logs
          </h3>
          {deals.length > 0 && (
            <button
              type="button"
              className="text-[11px] font-semibold text-muted hover:text-primary"
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
            deals.slice(0, 1).map((deal) => (
              <div
                key={deal.id}
                className="bg-white border border-border rounded-xl p-3 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-heading truncate">{deal.name}</p>
                    <p className="text-xs text-muted">
                      {new Date(deal.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-heading shrink-0 ml-2">
                  {formatCurrency(deal.commission, isHushed)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
