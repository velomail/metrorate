import React from "react";
import type { Deal } from "../hooks/useCommission";

function formatDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatTime(createdAt: string): string {
  return new Date(createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
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
      {/* Header */}
      <header className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="material-symbols-outlined text-primary text-xl">history</span>
            <h1 className="text-heading text-lg font-bold tracking-tight">Deal History</h1>
          </div>
          <p className="text-[11px] text-muted">
            {deals.length === 0 ? "No deals logged yet" : `${deals.length} deal${deals.length === 1 ? "" : "s"} logged`}
          </p>
        </div>
        {deals.length > 0 && clearDeals && (
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-medium text-muted bg-white hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            onClick={() => {
              if (window.confirm("Clear all saved deals from this browser?")) {
                clearDeals();
              }
            }}
          >
            Clear all
          </button>
        )}
      </header>

      {deals.length === 0 ? (
        <p className="text-xs text-muted msg-bubble msg-bubble-info">
          You haven&apos;t logged any deals yet. Head to the Log tab to start tracking your commissions.
        </p>
      ) : (
        <>
          {/* Desktop table view */}
          <div className="hidden lg:block">
            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_140px_140px_140px] gap-4 px-5 py-3 bg-slate-50 border-b border-border text-[10px] font-bold text-muted uppercase tracking-widest">
                <span>Client</span>
                <span>Date</span>
                <span className="text-right">Deal Value</span>
                <span className="text-right">Commission</span>
              </div>
              {/* Table rows */}
              <div className="divide-y divide-slate-100">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="grid grid-cols-[1fr_140px_140px_140px] gap-4 px-5 py-3.5 items-center hover:bg-slate-50/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-[14px]">handshake</span>
                      </div>
                      <span className="text-sm font-semibold text-heading truncate">{deal.name}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-heading">{formatDate(deal.createdAt)}</p>
                      <p className="text-[10px] text-muted">{formatTime(deal.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-heading">
                        {formatCurrency(deal.value, isHushed)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(deal.commission, isHushed)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile card view */}
          <div className="lg:hidden space-y-2">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-border hover:border-primary/30 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[14px]">handshake</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-heading font-semibold text-sm truncate">{deal.name}</span>
                    <span className="text-muted text-[11px]">{formatDate(deal.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-primary font-bold text-sm block">
                    {formatCurrency(deal.commission, isHushed)}
                  </span>
                  <span className="text-[10px] text-muted">
                    {formatCurrency(deal.value, isHushed)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
