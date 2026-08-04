import { UploadCloud } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

import { cn } from "../../../lib/utils";

interface FilePickerProps {
  id: string;
  label: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** `user` opens the selfie camera on mobile, `environment` the rear camera. */
  capture?: "user" | "environment";
  onSelect: (files: File[]) => void;
}

/**
 * Click-or-drop file field.
 *
 * Written against a plain `<input type="file">` rather than `react-dropzone`:
 * the flow needs `capture` for the selfie step (which the dropzone abstraction
 * hides) and nothing else here justifies the extra surface.
 */
export default function FilePicker({
  id,
  label,
  hint,
  accept,
  multiple,
  disabled,
  invalid,
  capture,
  onSelect,
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const emit = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length) onSelect(files);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    emit(event.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "rounded-lg border-[1px] border-dashed p-6 text-center transition-colors",
        dragging ? "border-[var(--primary)] bg-primary/5" : "border-input bg-muted/30",
        invalid && "border-destructive",
        disabled && "opacity-60"
      )}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        capture={capture}
        disabled={disabled}
        onChange={(e) => {
          emit(e.target.files);
          // Reset so picking the same file twice still fires a change event.
          e.target.value = "";
        }}
      />

      <UploadCloud
        className="mx-auto mb-[0.75rem] size-7 text-muted-foreground"
        aria-hidden="true"
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="text-sm font-medium text-[var(--primary)] underline-offset-4 hover:underline disabled:pointer-events-none"
      >
        {label}
      </button>

      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
