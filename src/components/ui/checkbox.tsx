"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "../../lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Note: avoid "bg-primary"/"text-primary-foreground" class names — a global
        // rule styles any button whose class contains those substrings as an emerald
        // gradient, which was bleeding onto the checkbox in both states.
        "peer size-4 shrink-0 rounded-[5px] border-[1.5px] border-input bg-background outline-none transition-colors",
        "hover:border-emerald-500/60",
        "data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white",
        "data-[state=indeterminate]:border-emerald-500 data-[state=indeterminate]:bg-emerald-500 data-[state=indeterminate]:text-white",
        "focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/25",
        "aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3" strokeWidth={3.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
