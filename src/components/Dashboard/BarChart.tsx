import { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import { MenuOutlined } from "@ant-design/icons";
import { Select, Dropdown, Menu, Button, Spin, DatePicker } from "antd";
import { getLosDashboardStatistics } from "../../redux/apis/apisCrud";
import Loader from "../Loader/Loader";
import dayjs from "dayjs";
const { Option } = Select;

// Chart palette — hex kept intentionally: SVG fill attributes don't resolve CSS custom properties
const CHART_COLORS = {
  applied:   "#4A90E2",
  approved:  "#73E98D",
  rejected:  "#FF6B6B",
  disbursed: "#FFCC6A",
} as const;
interface CustomerData {
  date: string;
  ApprovedFinanceAmounts: number;
  RejectedFinanceAmounts: number;
  DisbursedFinanceAmounts: number;
  AppliedFinanceAmounts: number;
}
const CustomBarChart = () => {
  const [data, setData] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<any>(dayjs());
  const [toDate, setToDate] = useState<any>(dayjs());
  const chartRef = useRef<any>(null);

  useEffect(() => {
    // Only call API when both dates are selected
    if (fromDate && toDate) {
      getLosDashboardStats();
    }
  }, [fromDate, toDate]);

  // Fetch LOS Dashboard Statistics
  const getLosDashboardStats = async () => {
    // Only proceed if both dates are selected
    if (!fromDate || !toDate) {
      return;
    }
    
    try {
      setLoading(true);
      // Format dates as YYYY-MM-DD for API
      const formattedFromDate = dayjs(fromDate).format("YYYY-MM-DD");
      const formattedToDate = dayjs(toDate).format("YYYY-MM-DD");
      const response = await getLosDashboardStatistics(formattedFromDate, formattedToDate);
      
      if (response?.data?.success && response?.data?.data) {
        const apiData = response.data.data;
        // Transform API data to chart format
        const formattedData: CustomerData[] = apiData.map((item: any) => ({
          date: item.date,
          ApprovedFinanceAmounts: item.ApprovedFinanceAmounts || 0,
          RejectedFinanceAmounts: item.RejectedFinanceAmounts || 0,
          DisbursedFinanceAmounts: item.DisbursedFinanceAmounts || 0,
          AppliedFinanceAmounts: item.AppliedFinanceAmounts || 0,
        }));
        
        // Reverse to show oldest to newest
        setData(formattedData.reverse());
      }
    } catch (error: any) {
      console.error("Error fetching LOS dashboard statistics:", error);
      toast.error(error?.message || "Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const downloadBlob = (blobOrText: Blob | string, filename: string, type?: string) => {
    const blob = typeof blobOrText === "string"
      ? new Blob([blobOrText], { type: type || "application/octet-stream" })
      : blobOrText;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const getSVGString = (): { svgString: string; width: number; height: number } | null => {
  
    const container = chartRef.current?.container;  // This will point to the container div
    if (!container) {
      console.error("Container element not found.");
      return null;
    }

    // Now, get the SVG element inside the container
    const svg = container.querySelector("svg") as SVGSVGElement | null;
    if (!svg) return null;



    // clone so we can safely set xmlns without mutating live node
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const { width, height } = svg.getBoundingClientRect();
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);

   
    return { svgString, width: Math.ceil(width), height: Math.ceil(height) };
  };

  const handleDownloadSVG = () => {
    const s = getSVGString();
    if (!s) {
      console.error("SVG export failed: SVG data is missing or undefined.");
      return;
    }


    downloadBlob(s.svgString, "dashboard-statistics.svg", "image/svg+xml;charset=utf-8");
  };

  const handleDownloadPNG = () => {
    const s = getSVGString();
     if (!s) {
      console.error("PNG export failed: SVG data is missing or undefined.");
      return;
    }

    const { svgString, width, height } = s;


    // Convert SVG to PNG via canvas
    const img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2; // For high-res PNG (optional)
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get canvas context.");
        return;
      }
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          
          downloadBlob(blob, "dashboard-statistics.png");
        } else {
          console.error("PNG export failed: Blob creation failed.");
        }
      });
    };
  };
  const handleDownloadCSV = () => {
    const rows = [
      ["Date", "Applied", "Approved", "Rejected", "Disbursed"],
      ...data.map((d) => [
        d.date,
        d.AppliedFinanceAmounts,
        d.ApprovedFinanceAmounts,
        d.RejectedFinanceAmounts,
        d.DisbursedFinanceAmounts
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    downloadBlob(csv, "dashboard-statistics.csv", "text/csv;charset=utf-8");
  };

  const menu = (
    <Menu>
      <Menu.Item key="svg" onClick={handleDownloadSVG}>Download SVG</Menu.Item>
      <Menu.Item key="png" onClick={handleDownloadPNG}>Download PNG</Menu.Item>
      <Menu.Item key="csv" onClick={handleDownloadCSV}>Download CSV</Menu.Item>
    </Menu>
  );

  const CustomLegend = () => (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginTop: 10, gap: 15 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 100,
            backgroundColor: CHART_COLORS.applied,
            marginRight: 5,
          }}
        />
        <span style={{ fontSize: 13 }}>Applied</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 100,
            backgroundColor: CHART_COLORS.approved,
            marginRight: 5,
          }}
        />
        <span style={{ fontSize: 13 }}>Approved</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 100,
            backgroundColor: CHART_COLORS.rejected,
            marginRight: 5,
          }}
        />
        <span style={{ fontSize: 13 }}>Rejected</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 100,
            backgroundColor: CHART_COLORS.disbursed,
            marginRight: 5,
          }}
        />
        <span style={{ fontSize: 13 }}>Disbursed</span>
      </div>
    </div>
  );
  return (
    <>
      <div>
      <h5 style={{ fontWeight: 600, margin: 0 }}>Finance Statistics</h5>
        <div style={{ display: "flex", justifyContent: "end", alignItems: "center", marginBottom: 20 }}>
        
          <div className="d-flex gap-3 justify-content-end">
             <DatePicker 
               placeholder="From Date" 
               defaultValue={dayjs()}
               value={fromDate ? dayjs(fromDate) : null}
               onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"))} 
               style={{width:"150px"}} 
             />
          <DatePicker 
            placeholder="To Date" 
            defaultValue={dayjs()}
            value={toDate ? dayjs(toDate) : null}
            onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"))} 
            style={{width:"150px"}}
          />
          </div>
          {/* <Dropdown overlay={menu} trigger={["click"]}>
            <Button
              style={{
                backgroundColor: "#fff",
                border: "1px solid #d9d9d9",
                padding: "5px 15px",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                
              }}
              icon={<MenuOutlined />}
            >
              Export
            </Button>
          </Dropdown> */}
        </div>
        
        {loading ? (
          <div >
           <Loader />
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                ref={chartRef}
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => {
                    // Format date from "2025-11-18" to "Nov 18" or "18 Nov"
                    if (!value) return "";
                    const date = dayjs(value);
                    if (date.isValid()) {
                      return date.format("MMM DD");
                    }
                    return value;
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  cursor={false}
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={(value: any) => new Intl.NumberFormat('en-US').format(value)}
                />

                <Bar
                  radius={[8, 8, 0, 0]}
                  dataKey="AppliedFinanceAmounts"
                  name="Applied"
                  barSize={15}
                  fill={CHART_COLORS.applied}
                />
                <Bar
                  radius={[8, 8, 0, 0]}
                  dataKey="ApprovedFinanceAmounts"
                  name="Approved"
                  barSize={15}
                  fill={CHART_COLORS.approved}
                />
                <Bar
                  radius={[8, 8, 0, 0]}
                  dataKey="RejectedFinanceAmounts"
                  name="Rejected"
                  barSize={15}
                  fill={CHART_COLORS.rejected}
                />
                <Bar
                  radius={[8, 8, 0, 0]}
                  dataKey="DisbursedFinanceAmounts"
                  name="Disbursed"
                  barSize={15}
                  fill={CHART_COLORS.disbursed}
                />
              </BarChart>
            </ResponsiveContainer>
            <CustomLegend />
          </>
        )}
      </div>
    </>
  );
};

export default CustomBarChart;
