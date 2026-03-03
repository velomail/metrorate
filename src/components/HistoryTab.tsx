import React from "react";
import type { Deal } from "../hooks/useCommission";

function formatHistoryDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export type HistoryTabProps = {
  deals: Deal[];
  formatCurrency: (value: number, isHushed: boolean) => React.ReactNode;
  isHushed: boolean;
  clearDeals?: () => void;
};

export const HistoryTab: React.FC<HistoryTabProps> = ({
  deals,
  formatCurrency,
  isHushed,
  clearDeals
}) => {
  return (
    <div className="space-y-4">
      <header className="px-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-2xl">
            history
          </span>
          <h1 className="text-heading text-lg font-semibold tracking-tight">
            Deal History
          </h1>
        </div>
        <p className="text-sm text-muted">
          Track your past commission logs
        </p>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3">
        {deals.length === 0 ? (
          <p className="text-xs text-muted msg-bubble msg-bubble-info">
            You haven&apos;t logged any deals yet. Log a deal on the Log tab to start your history.
          </p>
        ) : (
          deals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-heading font-semibold text-sm">
                  {deal.name}
                </span>
                <span className="text-muted text-[12px]">
                  {formatHistoryDate(deal.createdAt)}
                </span>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="text-primary font-semibold text-base">
                  {formatCurrency(deal.commission, isHushed)}
                </span>
              </div>
            </div>
          ))
        )}
      </main>

      {deals.length > 0 && clearDeals && (
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-medium text-muted bg-white hover:border-primary hover:text-primary transition-colors"
            onClick={() => {
              if (window.confirm("Clear all saved deals from this browser?")) {
                clearDeals();
              }
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
