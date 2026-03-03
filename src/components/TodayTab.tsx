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

  const visibleRecentDeals = recentDeals.slice(0, 3);

  return (
    <div className="space-y-4">
      <GlassCard className="p-5 flex flex-col gap-4 bg-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">
              Total Commission
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-primary">
                {formatCurrency(commissionThisMonth, isHushed)}
              </h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                This month
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Current pipeline {formatCurrency(totalValue, isHushed)}.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold text-muted hover:bg-slate-200 transition-colors"
            onClick={() => setIsHushed((v) => !v)}
          >
            <span className="material-symbols-outlined text-[14px]">
              {isHushed ? "visibility_off" : "visibility"}
            </span>
            <span>PRIVACY</span>
          </button>
        </div>

        <div className="space-y-4 pt-1">
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1.5 text-muted">
              <span>
                Monthly Goal:{" "}
                <span className="text-heading">
                  {formatCurrency(goal, false)}
                </span>
              </span>
              <span className="text-primary">
                {goal > 0 ? `${progress}%` : "—"}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${goal > 0 ? progress : 0}%` }}
              />
            </div>
          </div>

          {quota > 0 && (
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-1.5 text-muted">
                <span>
                  Sales Quota:{" "}
                  <span className="text-heading">
                    {formatCurrency(quota, false)}
                  </span>
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
                      quota > 0 && attainmentPercent !== null
                        ? Math.min(100, attainmentPercent)
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-5 flex flex-col gap-3 bg-white">
        <div className="flex justify-between items-center mb-1">
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
              {Math.max(freeDailyLimit - dealsTodayCount, 0)} logs remaining
            </p>
          </>
        )}
        {isPaid && (
          <p className="text-[10px] text-muted italic">
            Unlimited logs are active for this browser.
          </p>
        )}
      </GlassCard>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-heading px-1">Recent Deals</h3>
        {visibleRecentDeals.length === 0 ? (
          <p className="text-[11px] text-muted msg-bubble msg-bubble-info">
            No deals yet. Log your first deal on the Log tab to see it here.
          </p>
        ) : (
          visibleRecentDeals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between p-4 bg-white border border-border rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <div className="w-4 h-4 bg-primary rounded-sm opacity-60" />
                </div>
                <span className="text-sm font-bold text-heading">{deal.name}</span>
              </div>
              <span className="text-sm font-bold text-primary">
                {formatCurrency(deal.commission, isHushed)}
              </span>
            </div>
          ))
        )}
        {visibleRecentDeals.length > 0 && (
          <button
            type="button"
            className="w-full text-[11px] font-semibold text-primary hover:text-primary-dark text-center mt-1"
            onClick={() => setPage("history")}
          >
            View all history
          </button>
        )}
      </div>
    </div>
  );
};

