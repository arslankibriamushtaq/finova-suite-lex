import { CheckCircle2, Circle, FileText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  toBusinessOnboardingError,
  uploadBusinessDocuments,
  type BusinessDocumentKind,
} from "../../../redux/apis/apisBusinessOnboarding";
import FilePicker from "../components/FilePicker";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { BUSINESS_DOCUMENT_KINDS, documentKindLabelKey } from "../documentKinds";
import { routeForNextAction } from "../navigation";
import { useBusinessOnboarding } from "../OnboardingContext";

const MAX_FILE_MB = 10;
const ACCEPTED = ".pdf,.jpg,.jpeg,.png";

interface StagedFile {
  id: string;
  file: File;
  kind: BusinessDocumentKind;
}

const formatSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function DocumentsStep() {
  const { t } = useTranslation("businessOnboarding");
  const navigate = useNavigate();
  const { sessionId, data, applyStep } = useBusinessOnboarding();

  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [uploadedKinds, setUploadedKinds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const required = useMemo(() => data.requiredDocuments ?? [], [data.requiredDocuments]);

  // Rehydrate what previous visits already stored.
  useEffect(() => {
    const stored = Object.keys(data.businessDocuments ?? {});
    if (stored.length) {
      setUploadedKinds((prev) => Array.from(new Set([...prev, ...stored])));
    }
  }, [data.businessDocuments]);

  const missingRequired = required.filter((kind) => !uploadedKinds.includes(kind));

  const addFiles = (files: File[]) => {
    setError(null);

    const oversized = files.filter((file) => file.size > MAX_FILE_MB * 1024 * 1024);
    if (oversized.length) {
      setError(t("documents.error.tooLarge", { size: MAX_FILE_MB }));
    }

    const accepted = files.filter((file) => file.size <= MAX_FILE_MB * 1024 * 1024);
    if (!accepted.length) return;

    setStaged((prev) => {
      // Default each new file to the next document still outstanding, so the
      // common case (one file per required kind) needs no dropdown fiddling.
      const claimed = new Set<string>([
        ...uploadedKinds,
        ...prev.map((entry) => entry.kind),
      ]);

      const additions = accepted.map((file, index) => {
        const nextMissing = required.find((kind) => !claimed.has(kind));
        const kind = (nextMissing ?? "OTHER_BUSINESS_DOC") as BusinessDocumentKind;
        claimed.add(kind);
        return {
          id: `${file.name}-${file.size}-${prev.length + index}`,
          file,
          kind,
        };
      });

      return [...prev, ...additions];
    });
  };

  const handleUpload = async () => {
    if (!sessionId || !staged.length) return;

    setUploading(true);
    setError(null);
    try {
      const res = await uploadBusinessDocuments(
        sessionId,
        staged.map((entry) => ({ file: entry.file, documentKind: entry.kind }))
      );

      applyStep(res);

      const failed = (res.documents ?? []).filter((doc) => doc.failureReason);
      const stored = (res.documents ?? [])
        .filter((doc) => !doc.failureReason && doc.documentKind)
        .map((doc) => doc.documentKind as string);

      setUploadedKinds((prev) => Array.from(new Set([...prev, ...stored])));

      if (failed.length) {
        setError(
          failed
            .map((doc) => `${t(documentKindLabelKey(doc.documentKind ?? ""))}: ${doc.failureReason}`)
            .join(" · ")
        );
        // Keep only the files that failed so the applicant can retry just those.
        setStaged((prev) =>
          prev.filter((entry) => failed.some((doc) => doc.documentKind === entry.kind))
        );
        return;
      }

      setStaged([]);
    } catch (err) {
      setError(toBusinessOnboardingError(err, t("common.error.generic")).message);
    } finally {
      setUploading(false);
    }
  };

  // The server only advances `nextAction` past this step once at least one
  // document is stored, so it — not a local counter — decides when to unlock.
  const canContinue = Boolean(data.nextAction) && data.nextAction !== "UPLOAD_DOCUMENT";

  const handleContinue = () => {
    navigate(routeForNextAction(data.nextAction));
  };

  return (
    <StepCard title={t("documents.title")} description={t("documents.description")}>
      <div className="space-y-6">
        {required.length ? (
          <div className="space-y-3 rounded-lg border-[1px] border-border p-[1rem]">
            <p className="text-sm font-medium text-foreground">
              {t("documents.checklistTitle")}
            </p>
            <ul className="space-y-2">
              {required.map((kind) => {
                const done = uploadedKinds.includes(kind);
                return (
                  <li key={kind} className="flex items-center gap-2 text-sm">
                    {done ? (
                      <CheckCircle2
                        className="size-4 shrink-0 text-[var(--color-success)]"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span className={done ? "text-muted-foreground line-through" : ""}>
                      {t(documentKindLabelKey(kind))}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <FilePicker
          id="biz-documents"
          label={t("documents.picker.label")}
          hint={t("documents.picker.hint", { size: MAX_FILE_MB })}
          accept={ACCEPTED}
          multiple
          disabled={uploading}
          onSelect={addFiles}
        />

        {staged.length ? (
          <ul className="space-y-3">
            {staged.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-[0.75rem] rounded-lg border-[1px] border-border p-[0.75rem] sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FileText
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{entry.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(entry.file.size)}
                    </p>
                  </div>
                </div>

                <Select
                  value={entry.kind}
                  onValueChange={(kind) =>
                    setStaged((prev) =>
                      prev.map((item) =>
                        item.id === entry.id
                          ? { ...item, kind: kind as BusinessDocumentKind }
                          : item
                      )
                    )
                  }
                  disabled={uploading}
                >
                  <SelectTrigger
                    className="biz-kind-trigger"
                    aria-label={t("documents.kindLabel")}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_DOCUMENT_KINDS.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {t(documentKindLabelKey(kind))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={uploading}
                  aria-label={t("documents.remove", { name: entry.file.name })}
                  onClick={() =>
                    setStaged((prev) => prev.filter((item) => item.id !== entry.id))
                  }
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        {/* Advisory, never a gate — back-office review catches real gaps. */}
        {!staged.length && missingRequired.length ? (
          <StatusMessage tone="warning">
            {t("documents.pendingNudge", {
              done: required.length - missingRequired.length,
              total: required.length,
            })}
          </StatusMessage>
        ) : null}

        <div className="space-y-3">
          {staged.length ? (
            <SubmitButton
              type="button"
              onClick={handleUpload}
              loading={uploading}
              loadingLabel={t("documents.uploading")}
            >
              {t("documents.upload", { total: staged.length })}
            </SubmitButton>
          ) : null}

          <Button
            type="button"
            size="lg"
            variant={staged.length ? "outline" : "default"}
            className="w-full"
            disabled={uploading || !canContinue}
            onClick={handleContinue}
          >
            {t("common.continue")}
          </Button>

          {!canContinue ? (
            <p className="text-center text-xs text-muted-foreground">
              {t("documents.continueHint")}
            </p>
          ) : null}
        </div>
      </div>
    </StepCard>
  );
}
