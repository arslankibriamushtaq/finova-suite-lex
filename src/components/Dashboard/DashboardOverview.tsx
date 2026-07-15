import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./DashboardOverview.css";
import {
  ClipboardList,
  FileCheck2,
  Hourglass,
  BadgeCheck,
  FileX2,
  CalendarCheck2,
  Banknote,
  Users,
  type LucideIcon,
} from "lucide-react";
import PulseLoading from "../Loader/PulseLoader";

type CardTheme =
  | "emerald"
  | "teal"
  | "amber"
  | "green"
  | "rose"
  | "cyan"
  | "violet"
  | "indigo";

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  theme: CardTheme;
  link?: string;
}

const DashboardOverview: React.FC<{ applicationData: any; loading: boolean }> = ({
  applicationData,
  loading,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  const statsData: StatCard[] = [
    {
      title: t("overview.totalApplied"),
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalAppliedApplications,
      icon: ClipboardList,
      theme: "emerald",
      link: "/LOS/FinancingApplications/AllApplications",
    },
    {
      title: t("overview.totalCompleted"),
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalCompletedApplications,
      icon: FileCheck2,
      theme: "teal",
    },
    {
      title: t("overview.totalInProgress"),
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalInProgressApplications,
      icon: Hourglass,
      theme: "amber",
      link: "/LOS/FinancingApplications/InProgressFinancing",
    },
    {
      title: t("overview.totalApproved"),
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalApprovedApplications,
      icon: BadgeCheck,
      theme: "green",
      link: "/LOS/FinancingApplications/ApprovedFinancing",
    },
    {
      title: t("overview.totalRejected"),
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalRejectedApplications,
      icon: FileX2,
      theme: "rose",
      link: "/LOS/FinancingApplications/RejectedFinancing",
    },
    {
      title: t("overview.todaysCompleted"),
      value: loading ? <PulseLoading size="sm" /> : applicationData?.todaysCompletedApplications || 0,
      icon: CalendarCheck2,
      theme: "cyan",
    },
    {
      title: t("overview.totalDisbursed"),
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalDisbursedAmount,
      icon: Banknote,
      theme: "violet",
    },
    {
      title: t("overview.totalCustomers"),
      value: loading ? <PulseLoading size="sm" /> : applicationData?.totalCustomers,
      icon: Users,
      theme: "indigo",
      link: "/LOS/CustomerManagement/CustomerList",
    },
  ];

  const handleCardClick = (link?: string) => {
    if (link) {
      navigate(link);
    }
  };

  const formatValue = (val: any) => {
    if (val == null || typeof val === "object") return val;
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="row gy-3 dashboard-stats">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="col-12 col-sm-6 col-lg-3 d-flex">
            <div
              className={`stat-card stat-card--${stat.theme} ${stat.link ? "has-link" : ""}`}
              onClick={() => handleCardClick(stat.link)}
            >
              <div className="stat-card__row">
                <span className="stat-card__title">{stat.title}</span>
                <span className="stat-card__icon">
                  <Icon strokeWidth={2} />
                </span>
              </div>
              <p className="stat-card__value">{formatValue(stat.value)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardOverview;
