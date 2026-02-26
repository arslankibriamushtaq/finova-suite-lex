"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "../../lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      style={{ borderRadius: 9999 }}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center overflow-hidden border-2 border-transparent",
        "data-[state=unchecked]:bg-muted-foreground data-[state=checked]:bg-primary",
        "shadow-sm transition-colors duration-200 ease-in-out",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        style={{ borderRadius: 9999 }}
        className={cn(
          "pointer-events-none block size-5 shrink-0 bg-white shadow-md ring-0",
          "transition-transform duration-200 ease-in-out",
          "data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-5"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
