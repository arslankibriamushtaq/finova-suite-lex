import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../../../hooks/use-language";

interface BackLinkProps {
  to: string;
}

/**
 * Returns to the previous step.
 *
 * Navigates to an explicit route rather than calling `history.back()`: the
 * applicant may have arrived here from a resume, a reload or a passport skip,
 * so the browser's previous entry is not reliably the previous *step*.
 */
export default function BackLink({ to }: BackLinkProps) {
  const { t } = useTranslation("businessOnboarding");
  const navigate = useNavigate();
  const { isRTL } = useLanguage();

  // The chevron points back along the reading direction, so it has to mirror.
  const Icon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="biz-link inline-flex items-center gap-1"
    >
      <Icon className="size-4" aria-hidden="true" />
      {t("common.back")}
    </button>
  );
}
