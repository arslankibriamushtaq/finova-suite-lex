import type { ModuleLocale } from "../types";

/**
 * Onboarding step configuration — the screen that decides which steps the
 * mobile app shows for a country, in what order, and which screening gates run.
 *
 * The wording here carries the rules the API enforces and the UI must not
 * soften: four steps are the SAMA KYC backbone and can never be switched off,
 * reordering changes what the customer sees and not what the workflow runs,
 * saving replaces the whole configuration, and gate changes reach only
 * applications that have not started yet.
 *
 * `fr` and `ar` are intentionally empty: i18next falls back to `en`, so the
 * screen reads correctly in all three languages while this copy — which is
 * compliance wording, not UI chrome — goes through translation review. Fill
 * them in place; no screen changes when they land.
 */
const onboardingSteps: ModuleLocale = {
  namespace: "onboardingSteps",
  en: {
    title: "Onboarding Steps",
    subtitle:
      "Which steps the app shows for a country, in what order, and which screening gates run.",

    country: "Country",
    countryPlaceholder: "Select a country",
    summary: "{{enabled}} of {{total}} steps enabled",
    unsaved: "Unsaved changes",
    discard: "Discard",

    // --- the things the API enforces, said where they apply
    "note.gateLatency":
      "Screening gate changes apply to new applications only. A customer already part-way through finishes on the settings that were in force when they started.",
    "note.stepLatency": "Step and label changes can take up to 5 minutes to reach the app.",
    "note.mandatory":
      "Mobile, OTP, Nafath and Completion are the SAMA KYC backbone. They cannot be disabled or removed.",

    // --- list
    "list.empty": "This country has no configured steps.",
    "list.seed": "Seed the eight default steps",
    "list.moveUp": "Move up",
    "list.moveDown": "Move down",
    "list.drag": "Drag to reorder",
    "list.expand": "Show settings",
    "list.collapse": "Hide settings",
    "list.remove": "Remove step",
    "list.addStep": "Add step",
    "list.addStepEmpty": "Every step type is already configured.",
    "list.noLabel": "No label set",

    // --- badges
    "badge.mandatory": "Mandatory",
    "badge.mandatoryHint": "Required for SAMA KYC compliance — cannot be disabled or removed.",
    "badge.disabled": "Disabled",
    "badge.signalWait": "Waits for the customer",
    "badge.timeout": "{{minutes}} min",

    // --- fields
    "field.label": "Label (English)",
    "field.labelAr": "Label (Arabic)",
    "field.description": "Description",
    "field.provider": "Provider code",
    "field.timeout": "Timeout (minutes)",
    "field.signalWait": "Waits for the customer",
    "field.signalWaitHint": "The workflow pauses here until the customer acts. Informational.",
    "field.required": "Required",
    "field.requiredHint":
      "A business flag on this row. Separate from mandatory, and freely editable.",
    "field.advanced": "Advanced",

    // --- config gates
    "gate.section": "Screening gates",
    "gate.pep": "PEP audit logging",
    "gate.pepHint":
      "Records the background PEP screening result. Audit only — the PEP decision comes from the customer's own declaration and is not affected by this.",
    "gate.sanctions": "Sanctions screening",
    "gate.sanctionsHint": "Run sanctions screening during onboarding.",
    "gate.blockOnHit": "Fail onboarding on a sanctions hit",
    "gate.blockOnHitHint":
      "Off by default: a hit is recorded and the application continues. On: a hit fails the customer's onboarding outright.",
    "gate.aml": "AML risk scoring",
    "gate.amlHint":
      "Contributes to the final risk grade. Turning it off drops that contribution; the risk decision still runs.",
    "gate.fetchSalary": "Fetch salary (GOSI / Dakhli)",
    "gate.fetchSalaryHint": "Look up the customer's salary from GOSI/Dakhli during this step.",
    "gate.requireBank": "Require bank details",
    "gate.requireBankHint": "Descriptive only today — no backend behaviour is attached to it yet.",
    "gate.outcomeNote":
      "Either way the outcome is recorded on the application as CLEARED, HIT, ERROR or SKIPPED. ERROR is not CLEARED: a screen that failed is not a screen that came back clean.",

    // --- raw config
    "config.raw": "Configuration (JSON)",
    "config.rawHint": "Descriptive metadata for this step. No backend behaviour branches on it.",
    "config.invalid": "Not valid JSON — this must be a JSON object.",

    // --- blockOnHit confirmation
    "confirm.blockOnHit.title": "Fail onboarding on a sanctions hit?",
    "confirm.blockOnHit.body":
      "Today a sanctions hit is logged and the application continues. Turning this on means any customer who matches the sanctions list is refused onboarding outright.",
    "confirm.blockOnHit.compliance":
      "This is a compliance decision, not a settings tweak. It applies to applications started after you save.",
    "confirm.blockOnHit.action": "Turn on blocking",

    // --- remove confirmation
    "confirm.remove.title": "Remove {{step}}?",
    "confirm.remove.body":
      "Saving will delete this step from the country's configuration. The app stops showing it.",
    "confirm.remove.hint":
      "To keep it configured but hidden, switch it off instead of removing it.",
    "confirm.remove.action": "Remove step",

    // --- validation
    "valid.EMPTY": "A country needs at least one step.",
    "valid.ALL_DISABLED": "At least one step must stay enabled.",
    "valid.MANDATORY_DISABLED": "{{steps}} cannot be disabled — required for KYC compliance.",
    "valid.MANDATORY_MISSING": "{{steps}} cannot be removed — required for KYC compliance.",
    "valid.DUPLICATE": "{{steps}} appears more than once.",
    "valid.INVALID_CONFIG": "{{steps}} has invalid JSON in its configuration.",

    // --- toasts and errors
    "toast.saved": "Onboarding steps saved.",
    "toast.seeded": "Default steps created.",
    "toast.loadFailed": "Could not load the onboarding steps.",
    "toast.saveFailed": "Could not save the onboarding steps.",
    "toast.typesFailed": "Could not load the step catalogue.",
    "toast.countriesFailed": "Could not load the country list.",
    "err.notFound":
      "This country is not in the supported list, so it has no configuration to edit.",
    "err.noTenant": "Your session is missing a tenant. Sign in again.",
    "err.accessDenied": "Your role does not permit this action.",
    "err.validation": "Some of the values sent were not accepted.",
  },
  fr: {},
  ar: {},
};

export default onboardingSteps;
