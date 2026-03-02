/**
 * CSS variable references for theme tokens.
 * Replaces Theme.ts usage — values come from tokens.css.
 */
export const themeTokens = {
  primary: "var(--theme-primary)",
  secondary: "var(--theme-secondary)",
  tertiary: "var(--theme-tertiary)",
  textColor: "var(--theme-text-color)",
  gradientBackgroundColor: "var(--theme-gradient-background-color)",
  revertActionColor: "var(--theme-revert-action-color)",
  otherActionsColor: "var(--theme-other-actions-color)",
  breadcrumbActiveTextColor: "var(--theme-breadcrumb-active-text-color)",
  table: {
    backgroundColor: "var(--theme-table-background-color)",
    headingColor: "var(--theme-table-heading-color)",
    bodyTextColor: "var(--theme-table-body-text-color)",
  },
  headerColor: {
    backgroundColor: "var(--theme-header-background-color)",
    subHeaderBgColor: "var(--theme-header-sub-header-bg-color)",
    subheaderTextColor: "var(--theme-subheader-text-color)",
    dashboardHeaderBgColor: "var(--theme-dashboard-header-bg-color)",
    dashboardSubheaderBgColor: "var(--theme-dashboard-subheader-bg-color)",
  },
  color: {
    headingTextColor: "var(--theme-heading-text-color)",
  },
  dashboardSibeBarFlow: {
    flowSideBarLogoBg: "var(--theme-flow-sidebar-logo-bg)",
    flowDashboardSideBarBg: "var(--theme-flow-dashboard-sidebar-bg)",
    subMenuSideBarBg: "var(--theme-flow-submenu-sidebar-bg)",
    activeColorBg: "var(--theme-flow-active-color-bg)",
    inActiveColorBg: "var(--theme-flow-inactive-color-bg)",
    activeTextColor: "var(--theme-flow-active-text-color)",
    inActiveTextColor: "var(--theme-flow-inactive-text-color)",
  },
  dashboardSideBarView: {
    activeColorBg: "var(--theme-dashboard-sidebar-active-color-bg)",
    activeTextColor: "var(--theme-dashboard-sidebar-active-text-color)",
    inActiveColorBg: "var(--theme-dashboard-sidebar-inactive-color-bg)",
    inActiveTextColor: "var(--theme-dashboard-sidebar-inactive-text-color)",
  },
} as const;
