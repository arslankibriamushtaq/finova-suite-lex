import type { ModuleLocale } from "./types";

// ---------------------------------------------------------------------------
// Module locale registry.
//
// Each localized module owns ONE file in ./locales exporting a ModuleLocale.
// Register it in the `modules` array below. This file is the ONLY shared
// touch-point, kept to a single writer so parallel module work never conflicts.
// ---------------------------------------------------------------------------
import common from "./locales/common";
import sidebar from "./locales/sidebar";
import customerManagement from "./locales/customerManagement";
import lov from "./locales/lov";
import reports from "./locales/reports";
import riskManagement from "./locales/riskManagement";
import cardManagement from "./locales/cardManagement";
import loanManagement from "./locales/loanManagement";
import settings from "./locales/settings";
import investor from "./locales/investor";
import ledgerGl from "./locales/ledgerGl";
import connector from "./locales/connector";
import productManagement2 from "./locales/productManagement2";
import partner from "./locales/partner";
import cms from "./locales/cms";
import financing from "./locales/financing";
import dashboard from "./locales/dashboard";
import reconciliation from "./locales/reconciliation";
import walletBlocks from "./locales/walletBlocks";
import sullisCash from "./locales/sullisCash";
import system from "./locales/system";
import landingUser from "./locales/landingUser";
import webPages from "./locales/webPages";
import notifications from "./locales/notifications";
import onboardingSteps from "./locales/onboardingSteps";
import allApplication from "./locales/allApplication";
import accountingLoans from "./locales/accountingLoans";
import adminMisc from "./locales/adminMisc";
import bnpl from "./locales/bnpl";
import businessOnboarding from "./locales/businessOnboarding";
import customersB from "./locales/customersB";
import exchange from "./locales/exchange";
import walletLedger from "./locales/walletLedger";
import walletGlAccounts from "./locales/walletGlAccounts";
import walletQr from "./locales/walletQr";
import permissions from "./locales/permissions";
import crypto from "./locales/crypto";
import lex from "./locales/lex";
// <-- register new module locale files here (keep alphabetical)

const modules: ModuleLocale[] = [
  common,
  sidebar,
  customerManagement,
  lov,
  reports,
  riskManagement,
  cardManagement,
  loanManagement,
  settings,
  investor,
  ledgerGl,
  connector,
  productManagement2,
  partner,
  cms,
  financing,
  dashboard,
  reconciliation,
  walletBlocks,
  sullisCash,
  system,
  landingUser,
  webPages,
  notifications,
  onboardingSteps,
  allApplication,
  accountingLoans,
  adminMisc,
  bnpl,
  businessOnboarding,
  customersB,
  exchange,
  walletLedger,
  walletGlAccounts,
  walletQr,
  permissions,
  crypto,
  lex,
];

export const moduleNamespaces: string[] = modules.map((m) => m.namespace);

type LangBundle = Record<string, Record<string, string>>;

const byLang = (lang: keyof Pick<ModuleLocale, "en" | "fr" | "ar">): LangBundle =>
  modules.reduce((acc, m) => {
    acc[m.namespace] = m[lang];
    return acc;
  }, {} as LangBundle);

export const moduleResources = {
  en: byLang("en"),
  fr: byLang("fr"),
  ar: byLang("ar"),
};
