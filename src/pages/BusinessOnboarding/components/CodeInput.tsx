import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";

import { cn } from "../../../lib/utils";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
  /** Renders dots instead of digits — used for the app PIN. */
  masked?: boolean;
  label: string;
  id: string;
  /** Fired when the last box is filled, so the caller can auto-submit. */
  onComplete?: (value: string) => void;
}

/**
 * Fixed-length numeric code entry (OTP, emailed mPIN, app PIN).
 *
 * Hand-rolled rather than pulled from `input-otp`: that package ships a shadcn
 * wrapper in this repo but is not installed, and one small controlled component
 * is cheaper than a dependency.
 *
 * Boxes always run left-to-right (`dir="ltr"`) — digit sequences read LTR even
 * in Arabic, so mirroring them would show the code backwards.
 */
export default function CodeInput({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus,
  invalid,
  masked,
  label,
  id,
  onComplete,
}: CodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const completedRef = useRef(false);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  useEffect(() => {
    // Fire once per completion, not on every re-render at full length.
    if (value.length === length && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(value);
    }
    if (value.length < length) completedRef.current = false;
  }, [value, length, onComplete]);

  const focusBox = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  };

  const writeAt = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").replace(/\s/g, "").slice(0, length));
  };

  const handleChange = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) {
      writeAt(index, "");
      return;
    }

    // Typing over a filled box, or a burst from an autofilled SMS code.
    if (typed.length > 1) {
      const merged = (digits.join("").slice(0, index) + typed).slice(0, length);
      onChange(merged);
      focusBox(merged.length);
      return;
    }

    writeAt(index, typed);
    if (index < length - 1) focusBox(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        writeAt(index, "");
      } else if (index > 0) {
        writeAt(index - 1, "");
        focusBox(index - 1);
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusBox(pasted.length);
  };

  return (
    <div
      dir="ltr"
      role="group"
      aria-label={label}
      className="flex items-center justify-center gap-2 sm:gap-2.5"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          id={index === 0 ? id : `${id}-${index}`}
          type={masked ? "password" : "text"}
          inputMode="numeric"
          autoComplete={index === 0 && !masked ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={length}
          value={digit}
          disabled={disabled}
          aria-label={`${label} ${index + 1}`}
          aria-invalid={invalid || undefined}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "biz-code-box h-12 w-12 rounded-lg border-[1px] bg-[var(--surface-card)] text-center text-foreground shadow-xs transition-[color,box-shadow,border-color] outline-none sm:h-14 sm:w-14",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            invalid
              ? "border-destructive"
              : digit
                ? "border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]"
                : "border-input"
          )}
        />
      ))}
    </div>
  );
}
