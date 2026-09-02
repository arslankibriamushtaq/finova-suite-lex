import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { BillingCycle, Signup } from "../../redux/apis/apisTenantProvisioning";
import {
  getSelection,
  getSummary,
  setSelection as persistSelection,
  setSignupId,
  setReferenceNo,
  setSummary,
  type StoredSignupSummary,
} from "../../utils/tenantSignupSession";

/**
 * Shared state for the purchase journey.
 *
 * Two things live here rather than in router state:
 *
 *  - the **selection** (packages + billing cycle), because the details screen
 *    needs it to submit and the buyer may refresh or use the back button; and
 *  - the **created signup**, because the payment and provisioning screens are
 *    driven entirely by its `signupId` / `referenceNo` / frozen total.
 *
 * Both are mirrored into sessionStorage on write, and seeded from it on mount,
 * so a refresh anywhere in the flow does not strand someone who has paid.
 */

/** Which part of the details wizard is on screen — the rail names them all. */
export type WizardPart = "company" | "verify" | "details" | "you";

interface TenantSignupContextType {
  packageCodes: string[];
  billingCycle: BillingCycle;
  setSelection: (packageCodes: string[], billingCycle: BillingCycle) => void;
  togglePackage: (code: string) => void;

  /**
   * The wizard's current part, lifted out of the step so the rail can name it.
   *
   * The rail lists the four parts as steps of their own, and it is rendered by
   * the layout — a sibling of the screen that owns the state, not its parent.
   * This is the smallest thing that can be shared to join them up.
   */
  wizardPart: WizardPart;
  setWizardPart: (part: WizardPart) => void;

  /** The frozen quote — the amount that WILL be charged. Never recomputed. */
  summary: StoredSignupSummary | null;
  /** Records a freshly created signup and its frozen total. */
  acceptSignup: (signup: Signup) => void;
}

const TenantSignupContext = createContext<TenantSignupContextType | undefined>(undefined);

export function TenantSignupProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState(() => {
    const stored = getSelection();
    return {
      packageCodes: stored?.packageCodes ?? [],
      billingCycle: (stored?.billingCycle === "ANNUAL" ? "ANNUAL" : "MONTHLY") as BillingCycle,
    };
  });

  const [wizardPart, setWizardPart] = useState<WizardPart>("company");

  const [summary, setSummaryState] = useState<StoredSignupSummary | null>(() => getSummary());

  const setSelection = useCallback((packageCodes: string[], billingCycle: BillingCycle) => {
    setSelectionState({ packageCodes, billingCycle });
    persistSelection({ packageCodes, billingCycle });
  }, []);

  const togglePackage = useCallback((code: string) => {
    setSelectionState((current) => {
      const packageCodes = current.packageCodes.includes(code)
        ? current.packageCodes.filter((c) => c !== code)
        : [...current.packageCodes, code];

      const next = { ...current, packageCodes };
      persistSelection(next);
      return next;
    });
  }, []);

  const acceptSignup = useCallback((signup: Signup) => {
    const stored: StoredSignupSummary = {
      referenceNo: signup.referenceNo,
      companyName: signup.companyName,
      adminEmail: signup.adminEmail,
      billingCycle: signup.billingCycle,
      packageCodes: signup.packageCodes ?? [],
      subtotal: signup.subtotal,
      vatAmount: signup.vatAmount,
      totalAmount: signup.totalAmount,
      currency: signup.currency,
      expiresAt: signup.expiresAt ?? null,
    };

    setSignupId(signup.signupId);
    setReferenceNo(signup.referenceNo);
    setSummary(stored);
    setSummaryState(stored);
  }, []);

  const value = useMemo(
    () => ({
      packageCodes: selection.packageCodes,
      billingCycle: selection.billingCycle,
      setSelection,
      togglePackage,
      wizardPart,
      setWizardPart,
      summary,
      acceptSignup,
    }),
    [selection, setSelection, togglePackage, wizardPart, summary, acceptSignup]
  );

  return <TenantSignupContext.Provider value={value}>{children}</TenantSignupContext.Provider>;
}

export function useTenantSignup(): TenantSignupContextType {
  const context = useContext(TenantSignupContext);
  if (context === undefined) {
    throw new Error("useTenantSignup must be used within a TenantSignupProvider");
  }
  return context;
}
