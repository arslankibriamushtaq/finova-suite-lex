import type { ReactNode } from "react";

import { cn } from "../../../lib/utils";

interface StepCardProps {
  title: string;
  description?: ReactNode;
  /** Rendered top-right — e.g. a "change plan" link. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** The frame every screen after pricing shares: heading, sub-copy, content. */
export default function StepCard({
  title,
  description,
  aside,
  children,
  className,
}: StepCardProps) {
  return (
    <section className={cn("ts-card rounded-2xl p-6 sm:p-8", className)}>
      <header className="mb-7 flex items-start justify-between gap-[1rem]">
        <div className="min-w-0">
          <h1 className="ts-title">{title}</h1>
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
