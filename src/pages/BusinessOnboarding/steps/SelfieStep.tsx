import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "../../../components/ui/button";
import {
  toBusinessOnboardingError,
  uploadBusinessSelfie,
} from "../../../redux/apis/apisBusinessOnboarding";
import FilePicker from "../components/FilePicker";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { useBusinessOnboarding } from "../OnboardingContext";

const MAX_FILE_MB = 10;

/** Terminal step: face-matches against the passport, then creates the customer. */
export default function SelfieStep() {
  const { t } = useTranslation("businessOnboarding");
  const { sessionId, data, goNext, restart } = useBusinessOnboarding();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSelect = (files: File[]) => {
    const picked = files[0];
    if (!picked) return;
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setError(t("documents.error.tooLarge", { size: MAX_FILE_MB }));
      return;
    }
    setError(null);
    setFile(picked);
  };

  const handleUpload = async () => {
    if (!sessionId || !file) return;

    setUploading(true);
    setError(null);
    try {
      const res = await uploadBusinessSelfie(sessionId, file);

      if (res.maxAttemptsReached) {
        setExhausted(true);
        return;
      }
      if (res.failureReason) {
        setError(res.failureReason);
        setFile(null);
        return;
      }

      goNext(res);
    } catch (err) {
      const apiError = toBusinessOnboardingError(err, t("common.error.generic"));
      if (apiError.maxAttemptsReached) {
        setExhausted(true);
        return;
      }
      setError(apiError.message);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  if (exhausted) {
    return (
      <StepCard title={t("selfie.exhausted.title")}>
        <StatusMessage tone="error">{t("selfie.exhausted.body")}</StatusMessage>
        <Button size="lg" className="mt-6 w-full" onClick={restart}>
          {t("passport.exhausted.restart")}
        </Button>
      </StepCard>
    );
  }

  return (
    <StepCard
      title={t("selfie.title")}
      description={
        data.passportReused ? t("selfie.descriptionReused") : t("selfie.description")
      }
    >
      <div className="space-y-5">
        <ul className="biz-list list-disc space-y-1 text-sm text-muted-foreground">
          <li>{t("selfie.tip.light")}</li>
          <li>{t("selfie.tip.face")}</li>
          <li>{t("selfie.tip.accessories")}</li>
        </ul>

        {previewUrl ? (
          <figure className="overflow-hidden rounded-lg border-[1px] border-border">
            <img
              src={previewUrl}
              alt={t("selfie.previewAlt")}
              className="max-h-72 w-full object-contain"
            />
            <figcaption className="flex items-center justify-between gap-[0.75rem] border-t border-border px-[0.75rem] py-2 text-xs text-muted-foreground">
              <span className="truncate">{file?.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                disabled={uploading}
                className="shrink-0 font-medium text-[var(--primary)] underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50"
              >
                {t("selfie.retake")}
              </button>
            </figcaption>
          </figure>
        ) : (
          <FilePicker
            id="biz-selfie"
            label={t("selfie.picker.label")}
            hint={t("selfie.picker.hint", { size: MAX_FILE_MB })}
            accept="image/jpeg,image/png,image/jpg"
            capture="user"
            disabled={uploading}
            onSelect={handleSelect}
          />
        )}

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        {uploading ? (
          <StatusMessage tone="info" title={t("selfie.processingTitle")}>
            <span className="flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              {t("selfie.processingBody")}
            </span>
          </StatusMessage>
        ) : null}

        <SubmitButton
          type="button"
          onClick={handleUpload}
          disabled={!file}
          loading={uploading}
          loadingLabel={t("selfie.processing")}
        >
          {t("selfie.submit")}
        </SubmitButton>
      </div>
    </StepCard>
  );
}
