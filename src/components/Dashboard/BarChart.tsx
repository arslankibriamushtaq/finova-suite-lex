import { useEffect, useState, useRef } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
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
  applied: number;
  approved: number;
  rejected: number;
  disbursed: number;
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
    if (!fromDate || !toDate) {
      return;
    }

    try {
      setLoading(true);
      const formattedFromDate = dayjs(fromDate).format("YYYY-MM-DD");
      const formattedToDate = dayjs(toDate).format("YYYY-MM-DD");
      const response = await getLosDashboardStatistics(formattedFromDate, formattedToDate);

      if (response?.data?.data?.financeStatistics) {
        const apiData = response.data.data.financeStatistics;
        const formattedData: CustomerData[] = apiData.map((item: any) => ({
          date: item.date,
          applied: item.applied || 0,
          approved: item.approved || 0,
          rejected: item.rejected || 0,
          disbursed: item.disbursed || 0,
        }));
        setData(formattedData);
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
        d.applied,
        d.approved,
        d.rejected,
        d.disbursed
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
        
        <div style={{ position: "relative", minHeight: 400 }}>
          {loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.6)", zIndex: 10, borderRadius: 8 }}>
              <Loader />
            </div>
          )}
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              ref={chartRef}
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="gradApplied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.applied} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={CHART_COLORS.applied} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.approved} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={CHART_COLORS.approved} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.rejected} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={CHART_COLORS.rejected} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradDisbursed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.disbursed} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={CHART_COLORS.disbursed} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(value) => {
                  if (!value) return "";
                  const date = dayjs(value);
                  if (date.isValid()) {
                    return date.format("MMM D");
                  }
                  return value;
                }}
                axisLine={{ stroke: "var(--surface-border)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                label={{ value: "Amount", angle: -90, position: "insideLeft", style: { fill: "var(--muted-foreground)", fontSize: 11 } }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: CHART_COLORS.applied, strokeWidth: 2, strokeDasharray: "0" }}
                content={(props: any) => {
                  if (!props.active || !props.payload?.length) return null;
                  const label = props.label ? dayjs(props.label).format("MMM D, YYYY") : "";
                  const get = (key: string) =>
                    props.payload.find((p: any) => p.dataKey === key)?.value ?? 0;
                  return (
                    <div
                      style={{
                        backgroundColor: "var(--surface-card)",
                        border: "1px solid var(--surface-border)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        boxShadow: "var(--surface-elevation-2)",
                        fontSize: 12,
                        minWidth: 140,
                      }}
                    >
                      <div style={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 6 }}>{label}</div>
                      <div style={{ color: CHART_COLORS.applied, marginBottom: 2 }}>Applied: {get("applied")}</div>
                      <div style={{ color: CHART_COLORS.approved, marginBottom: 2 }}>Approved: {get("approved")}</div>
                      <div style={{ color: CHART_COLORS.rejected, marginBottom: 2 }}>Rejected: {get("rejected")}</div>
                      <div style={{ color: CHART_COLORS.disbursed }}>Disbursed: {get("disbursed")}</div>
                    </div>
                  );
                }}
              />

              <Area
                type="monotone"
                dataKey="applied"
                name="Applied"
                stroke={CHART_COLORS.applied}
                strokeWidth={2}
                fill="url(#gradApplied)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface-card)" }}
              />
              <Area
                type="monotone"
                dataKey="approved"
                name="Approved"
                stroke={CHART_COLORS.approved}
                strokeWidth={2}
                fill="url(#gradApproved)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface-card)" }}
              />
              <Area
                type="monotone"
                dataKey="rejected"
                name="Rejected"
                stroke={CHART_COLORS.rejected}
                strokeWidth={2}
                fill="url(#gradRejected)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface-card)" }}
              />
              <Area
                type="monotone"
                dataKey="disbursed"
                name="Disbursed"
                stroke={CHART_COLORS.disbursed}
                strokeWidth={2}
                fill="url(#gradDisbursed)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--surface-card)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <CustomLegend />
        </div>
      </div>
    </>
  );
};

export default CustomBarChart;
