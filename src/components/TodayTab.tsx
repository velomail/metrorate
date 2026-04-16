import React from "react";
import { GlassCard } from "./GlassCard";
import type { Deal } from "../hooks/useCommission";

export type TodayTabProps = {
  commissionThisMonth: number;
  totalValue: number;
  goal: number;
  quota: number;
  attainmentPercent: number | null;
  progress: number;
  isHushed: boolean;
  setIsHushed: (v: (prev: boolean) => boolean) => void;
  isPaid: boolean;
  freeDailyLimit: number;
  dealsTodayCount: number;
  recentDeals: Deal[];
  formatCurrency: (value: number, isHushed: boolean) => React.ReactNode;
  setPage: (page: "log" | "dashboard" | "history" | "settings") => void;
};

export const TodayTab: React.FC<TodayTabProps> = ({
  commissionThisMonth,
  totalValue,
  goal,
  quota,
  attainmentPercent,
  progress,
  isHushed,
  setIsHushed,
  isPaid,
  freeDailyLimit,
  dealsTodayCount,
  recentDeals,
  formatCurrency,
  setPage
}) => {
  const logsUsedPercent =
    freeDailyLimit > 0
      ? Math.min(100, Math.round((dealsTodayCount / freeDailyLimit) * 100))
      : 0;

  const visibleRecentDeals = recentDeals.slice(0, 4);

  return (
    <div className="space-y-5">

      {/* ── Hero commission card ──────────────────────────────────────── */}
      <GlassCard className="p-5 lg:p-6 bg-white">
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">
              Total Commission
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary">
                {formatCurrency(commissionThisMonth, isHushed)}
              </h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                This month
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Pipeline: {formatCurrency(totalValue, isHushed)}
            </p>
          </div>
          {/* Privacy toggle — mobile only (desktop header has it) */}
          <button
            type="button"
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold text-muted hover:bg-slate-200 transition-colors shrink-0"
            onClick={() => setIsHushed((v) => !v)}
          >
            <span className="material-symbols-outlined text-[14px]">
              {isHushed ? "visibility_off" : "visibility"}
            </span>
            <span>PRIVACY</span>
          </button>
        </div>

        {/* Progress bars — side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1.5 text-muted">
              <span>
                Monthly Goal:{" "}
                <span className="text-heading">{formatCurrency(goal, false)}</span>
              </span>
              <span className="text-primary">{goal > 0 ? `${progress}%` : "—"}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${goal > 0 ? progress : 0}%` }}
              />
            </div>
          </div>

          {quota > 0 ? (
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-1.5 text-muted">
                <span>
                  Sales Quota:{" "}
                  <span className="text-heading">{formatCurrency(quota, false)}</span>
                </span>
                <span className="text-primary">
                  {attainmentPercent !== null ? `${attainmentPercent}%` : "—"}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/70 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      attainmentPercent !== null ? Math.min(100, attainmentPercent) : 0
                    }%`
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <button
                type="button"
                className="text-[11px] font-semibold text-primary/70 hover:text-primary transition-colors"
                onClick={() => setPage("settings")}
              >
                + Set a sales quota
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* ── Stats row — logs usage ───────────────────────────────────── */}
      <GlassCard className="p-5 bg-white">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold text-heading">Free Logs Today</p>
          <span className="text-[10px] font-bold bg-slate-100 text-muted px-2 py-0.5 rounded">
            {isPaid ? "Unlimited" : `${dealsTodayCount} / ${freeDailyLimit}`}
          </span>
        </div>
        {!isPaid && (
          <>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${logsUsedPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-muted italic">
              {Math.max(freeDailyLimit - dealsTodayCount, 0)} logs remaining today
            </p>
          </>
        )}
        {isPaid && (
          <p className="text-[10px] text-muted italic">
            Unlimited logs are active for this browser.
          </p>
        )}
      </GlassCard>

      {/* ── Recent deals ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-heading">Recent Deals</h3>
          {visibleRecentDeals.length > 0 && (
            <button
              type="button"
              className="text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors"
              onClick={() => setPage("history")}
            >
              View all
            </button>
          )}
        </div>

        {visibleRecentDeals.length === 0 ? (
          <p className="text-[11px] text-muted msg-bubble msg-bubble-info">
            No deals yet. Log your first deal on the Log tab to see it here.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {visibleRecentDeals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between p-4 bg-white border border-border rounded-xl shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[16px]">handshake</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-heading block truncate">{deal.name}</span>
                    <span className="text-[10px] text-muted">
                      {new Date(deal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary shrink-0 ml-3">
                  {formatCurrency(deal.commission, isHushed)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
