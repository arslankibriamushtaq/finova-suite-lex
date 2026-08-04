import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

interface SubmitButtonProps {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  /** Shown in place of the label while `loading` — e.g. "Verifying…". */
  loadingLabel?: string;
  type?: "submit" | "button";
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

/** Primary action for a step: full-width, disabled and labelled while in flight. */
export default function SubmitButton({
  children,
  loading,
  disabled,
  loadingLabel,
  type = "submit",
  onClick,
  variant = "default",
  className,
}: SubmitButtonProps) {
  return (
    <Button
      type={type}
      size="lg"
      variant={variant}
      onClick={onClick}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={cn("biz-submit h-11 w-full", className)}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
