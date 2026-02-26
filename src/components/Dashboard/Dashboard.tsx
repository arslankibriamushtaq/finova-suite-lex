import Graphs from "./Graphs";

import { DatePicker } from "antd";
import { RootState } from "../../redux/rootReducer";
import { useSelector } from "react-redux";

function Dashboard() {
  const dashboardStructure = useSelector(
    (state: RootState) => state.block.dashboardStructure
  );
  const renderedFinanceOverview =
    dashboardStructure?.financeOverview &&
    dashboardStructure?.financeOverview.map((item: any, index: any) => (
      <div key={index} className="view-chart mb-4">
        <div className="chart-header d-flex mobile-responsive-chart justify-content-between align-items-center">
          <h3 className="welcome-heading col-xl-3 col-12">{item.title}</h3>
          <div className="d-flex mobile-responsive-chart-filter col-xl-9 col-12 align-items-center justify-content-end">
            <div className="d-grid">
              <label htmlFor="" className="label-theme">
                From
              </label>
              <DatePicker
                style={{
                  width: "200px",
                  height: "36px",
                  marginRight: "10px",
                }}
              />
            </div>
            <div className="d-grid">
              <label htmlFor="" className="label-theme">
                To
              </label>
              <DatePicker
                style={{
                  width: "200px",
                  height: "36px",
                }}
              />
            </div>
          </div>
        </div>
        {item?.child &&
          item?.child.map((chart: any, chartIndex: any) => (
            <div style={{ marginTop: "20px" }}>
              <Graphs key={chartIndex} option={chart} />
            </div>
          ))}
      </div>
    ));
  const renderedBarOverview =
    dashboardStructure?.barchart &&
    dashboardStructure?.barchart.map((item: any, index: any) => {
      return (
        <div key={index} className="col-md-6 col-12 p-2">
          <h2 className="col-12 fs-6 fw-bold mt-5">{item.title}</h2>
          {item.child.map((chart: any, chartIndex: any) => {
            return (
              <div className="view-chart" key={chartIndex}>
                <Graphs option={chart} />
              </div>
            );
          })}
        </div>
      );
    });
  // const dashbaordTables =
  //   dashboardStructure?.table &&
  //   dashboardStructure?.table.map((item: any, index: any) => (
  //     <div className="col-12">
  //       <RecentApplication data={item} />
  //     </div>
  //   ));
  return <div>body</div>;
}

export default Dashboard;
