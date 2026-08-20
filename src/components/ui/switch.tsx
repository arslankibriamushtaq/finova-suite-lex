"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "../../lib/utils"

// Table-cell button rules (e.g. `.rdt_TableCell button { height:auto!important;
// padding:3px!important }`) target the <button> the Radix switch renders and inflate
// it into a blob. Those rules have specificity (0,1,1); inline styles can't carry
// !important, so we inject a higher-specificity (0,2,0) !important override. It ships
// with this JS module, so it applies even when the compiled stylesheet is cached/stale.
if (typeof document !== "undefined" && !document.getElementById("radix-switch-size-fix")) {
  const style = document.createElement("style")
  style.id = "radix-switch-size-fix"
  style.textContent = `
    .rdt_TableCell [data-slot="switch"], .ant-table-cell [data-slot="switch"], table td [data-slot="switch"], [data-slot="switch"] {
      width: 44px !important; min-width: 44px !important;
      height: 24px !important; min-height: 24px !important; max-height: 24px !important;
      padding: 0 !important; box-sizing: border-box !important; flex-shrink: 0 !important;
      display: inline-flex !important; align-items: center !important; overflow: hidden !important;
    }
    .rdt_TableCell [data-slot="switch-thumb"], .ant-table-cell [data-slot="switch-thumb"], table td [data-slot="switch-thumb"], [data-slot="switch-thumb"] {
      width: 20px !important; height: 20px !important; flex-shrink: 0 !important;
    }
  `
  document.head.appendChild(style)
}

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      // Geometry pinned inline so no table-cell/Bootstrap button rule (which
      // targets the <button> this renders) can inflate the track into a blob.
      // maxHeight caps the height even against a `height:auto !important` rule
      // (inline height alone can't beat !important, but max-height isn't overridden).
      style={{ borderRadius: 9999, display: "inline-flex", alignItems: "center", overflow: "hidden", width: 44, height: 24, maxHeight: 24, minWidth: 44, padding: 0, boxSizing: "border-box", flexShrink: 0 }}
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
        style={{ borderRadius: 9999, width: 20, height: 20, flexShrink: 0 }}
        className={cn(
          "pointer-events-none block size-5 shrink-0 bg-white shadow-md ring-0",
          "transition-transform duration-200 ease-in-out",
          // translate-x is physical, and the track is a flex row: in RTL the
          // thumb starts at the right edge, so translating it further right
          // pushed it out of the track and overflow:hidden clipped it away —
          // the switch rendered as a plain pill with no knob. The two variants
          // are mutually exclusive, so neither can win over the other.
          "ltr:data-[state=unchecked]:translate-x-0.5 ltr:data-[state=checked]:translate-x-5",
          "rtl:data-[state=unchecked]:-translate-x-0.5 rtl:data-[state=checked]:-translate-x-5"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
