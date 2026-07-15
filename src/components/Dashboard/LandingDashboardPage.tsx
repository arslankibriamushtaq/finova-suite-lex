import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {getDashboardStatistics } from "../../redux/apis/apisCrud";
import BarChart from "../Dashboard/BarChart";
import { Col, Card, DatePicker } from "antd";
import dayjs from "dayjs";
import DashboardOverview from "./DashboardOverview";
import DashboardRecentApplications from "./DashboardRecentApplications";
import { useTranslation } from "react-i18next";
const LandingDashboardPage = () => {
  const { t } = useTranslation("dashboard");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>();
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  const getStatistics = async () => {
    setLoading(true);
    try {
      const formattedFromDate = fromDate ? dayjs(fromDate).format("YYYY-MM-DD") : undefined;
      const formattedToDate = toDate ? dayjs(toDate).format("YYYY-MM-DD") : undefined;
      const response = await getDashboardStatistics(formattedFromDate, formattedToDate);
      if (response) {
        const responseData = response?.data?.data;
        setDashboardData(responseData?.cards);
        setRecentApplications(responseData?.recentApplications || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  }
  
  const handleFromDateChange = (date: any) => {
    setFromDate(date);
  };

  const handleToDateChange = (date: any) => {
    setToDate(date);
  };

  useEffect(() => {
    getStatistics();
  }, [fromDate, toDate]);
 
  return (
    <>
      <div className="dashboard dash-one">
        {/* <div className="row"> */}
          {/* Date Filter Section - Right Side */}
          <div className="col-12 py-3">
            <div className="d-flex justify-content-end align-items-end gap-3">
              <div style={{ minWidth: "180px" }}>
                <label htmlFor="fromDate" className="form-label" style={{ marginBottom: "8px", display: "block", fontSize: "14px", fontWeight: 500 }}>
                  {t("common:from")}
                </label>
                <DatePicker
                  value={fromDate}
                  onChange={handleFromDateChange}
                  placeholder={t("home.selectFromDate")}
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                />
              </div>
              <div style={{ minWidth: "180px" }}>
                <label htmlFor="toDate" className="form-label" style={{ marginBottom: "8px", display: "block", fontSize: "14px", fontWeight: 500 }}>
                  {t("common:to")}
                </label>
                <DatePicker
                  value={toDate}
                  onChange={handleToDateChange}
                  placeholder={t("home.selectToDate")}
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    if (fromDate) {
                      return current && current < dayjs(fromDate).startOf('day');
                    }
                    return false;
                  }}
                />
              </div>
            </div>
          </div>
         
          <DashboardOverview applicationData={dashboardData} loading={loading}/>
          <div className="d-flex mt-3 col-12 gap-3">
            <div style={{ flex: 8.8 }}>
              <Col>
                <Card className="dashboard-graph-card">
                  <BarChart />
                </Card>
              </Col>
            </div>
          </div>
          <DashboardRecentApplications recentApplications={recentApplications} loading={loading}/>

        {/* </div> */}
      </div>
    </>
  );
};

export default LandingDashboardPage;
