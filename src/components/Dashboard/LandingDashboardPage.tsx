import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {getDashboardStatistics } from "../../redux/apis/apisCrud";
import BarChart from "../Dashboard/BarChart";
import { Col, Card, DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import DashboardOverview from "./DashboardOverview";
import DashboardRecentApplications from "./DashboardRecentApplications";
import { useTranslation } from "react-i18next";
const LandingDashboardPage = () => {
  const { t } = useTranslation("dashboard");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>();
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

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
  
  const handleFromDateChange = (date: Dayjs | null) => {
    setFromDate(date);
  };

  const handleToDateChange = (date: Dayjs | null) => {
    setToDate(date);
  };

  /**
   * What the two pickers will accept.
   *
   * Only half of this was enforced before: To could not precede From, but From
   * could be moved past To, which left an inverted range that was still sent to
   * the API. Both ends are now bounded by the other.
   *
   * Neither end accepts a future date. These are counts of applications that
   * already exist, so a range running into next year returns exactly what one
   * ending today returns — an empty result the reader has no way to explain.
   */
  const isFuture = (day: Dayjs) => day.isAfter(dayjs().endOf("day"));

  const disabledFromDate = (current: Dayjs) =>
    !!current &&
    (isFuture(current) || (toDate ? current.isAfter(dayjs(toDate).endOf("day")) : false));

  const disabledToDate = (current: Dayjs) =>
    !!current &&
    (isFuture(current) || (fromDate ? current.isBefore(dayjs(fromDate).startOf("day")) : false));

  // The pickers cannot produce this, but state set any other way can, and an
  // inverted range is a request with no useful answer.
  const rangeInvalid = !!fromDate && !!toDate && dayjs(fromDate).isAfter(dayjs(toDate), "day");

  useEffect(() => {
    if (rangeInvalid) return;
    getStatistics();
  }, [fromDate, toDate, rangeInvalid]);
 
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
                  disabledDate={disabledFromDate}
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
                  disabledDate={disabledToDate}
                />
              </div>
            </div>
            {rangeInvalid && (
              <p
                role="alert"
                className="mb-0 mt-2 text-end"
                style={{ fontSize: "13px", color: "var(--destructive)" }}
              >
                {t("home.invalidRange")}
              </p>
            )}
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
