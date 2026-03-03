import { ReactNode } from "react";

type GlassCardProps = {
  className?: string;
  children: ReactNode;
};

export function GlassCard({ className = "", children }: GlassCardProps) {
  return (
    <div
      className={`glass-card border-border rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}

