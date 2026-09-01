import type { ReactNode } from "react";

import { cn } from "../../../lib/utils";

interface StepCardProps {
  title: string;
  description?: ReactNode;
  /** Rendered top-right — e.g. a "change plan" link. */
  aside?: ReactNode;
  /** A short marker on the title line — e.g. "Step 1 of 2". */
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** The frame every screen after pricing shares: heading, sub-copy, content. */
export default function StepCard({
  title,
  description,
  aside,
  meta,
  children,
  className,
}: StepCardProps) {
  return (
    <section className={cn("ts-card rounded-2xl p-5 sm:p-6", className)}>
      <header className="mb-[1.25rem] flex items-start justify-between gap-[1rem]">
        <div className="min-w-0">
          {/* The counter rides on the title line. As a line of its own it cost
              a full row of vertical space to say four words. */}
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="ts-title">{title}</h1>
            {meta ? <span className="ts-step-chip">{meta}</span> : null}
          </div>
          {description ? (
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </header>

      {children}
    </section>
  );
}
