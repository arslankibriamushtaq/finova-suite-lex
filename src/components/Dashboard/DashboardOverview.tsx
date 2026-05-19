import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardOverview.css";
import AntDesignIcon from "../../assets/img/ant-design.png";
import FileMinusIcon from "../../assets/img/la_file-.png";
import FileRejectIcon from "../../assets/img/la_file-i.png";
import FileInIcon from "../../assets/img/la_file-in.png";
import FileInvoiIcon from "../../assets/img/la_file-invoi.png";
import FileIcon from "../../assets/img/la_file.png";
import FileInvoi1Icon from "../../assets/img/la_file-invoi-1.png";
import { PulseLoader } from "react-spinners";

interface StatCard {
  title: string;
  value: string | number;
  image: string;
  link?: string;
  activeClass?: string;
}



const DashboardOverview: React.FC<{applicationData: any,loading: boolean}> = ({applicationData,loading}) => {
  const navigate = useNavigate();
  
  const statsData: StatCard[] = [
    {
      title: "Total Applied Applications",
      value:loading?<PulseLoader/>:applicationData?.totalAppliedApplications,
      image: AntDesignIcon,
      activeClass: "active3",
      link: "/LOS/FinancingApplications/AllApplications",
    },
    {
      title: "Total Completed Applications",
      value:loading?<PulseLoader/>:applicationData?.totalCompletedApplications,
      image: FileInvoiIcon,
    },
    {
      title: "Total In Progress Applications",
      value:loading?<PulseLoader/>:applicationData?.totalInProgressApplications,
      image: FileIcon,
      link: "/LOS/FinancingApplications/InProgressFinancing",
    },
    {
      title: "Total Approved Applications",
      value:loading?<PulseLoader/>:applicationData?.totalApprovedApplications,
      image: FileInIcon,
      link: "/LOS/FinancingApplications/ApprovedFinancing",
    },
    {
      title: "Total Rejected Applications",
      value:loading?<PulseLoader/>:applicationData?.totalRejectedApplications,
      image: FileRejectIcon,
      activeClass: "active4",
      link: "/LOS/FinancingApplications/RejectedFinancing",
    },
    {
      title: "Today's Completed Applications",
      value:loading?<PulseLoader/>:applicationData?.todaysCompletedApplications || 0,
      image: FileInIcon,
    },
    {
      title: "Total Disbursed Amount",
      value:loading?<PulseLoader/>:applicationData?.totalDisbursedAmount,
      image: FileInvoi1Icon,
    },
    {
      title: "Total Customers",
      value:loading?<PulseLoader/>:applicationData?.totalCustomers,
      image: FileMinusIcon,
      activeClass: "active4",
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
        return (
          <div
            key={index}
            className="col-12 col-sm-6 col-lg-3 d-flex"
          >
            <div
              className={`total-loan ${stat.link ? "has-link" : ""} ${stat.activeClass || ""}`}
              onClick={() => handleCardClick(stat.link)}
            >
              <div className="card-header-strip">
                <label className="label-theme">{stat.title}</label>
              </div>

              <div className="card-body-strip">
                <p className="p-theme cards-text">{formatValue(stat.value)}</p>
                <div className="icon-circle">
                  <img src={stat.image} alt={stat.title} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardOverview;
