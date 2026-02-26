import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ChartSkeleton = (value: any ) => {
  return (
    <div className="position-relative w-100 px-5" style={{ height: "225px" }}>
      {/* Y-Axis Line */}
      <div
        className="position-absolute"
        style={{
          left: "30px",
          top: 0,
          bottom: "20px",
          width: "2px",
          backgroundColor: "#ccc",
        }}
      />

      {/* X-Axis Line */}
      <div
        className="position-absolute"
        style={{
          left: "30px",
          right: "20px",
          bottom: "20px",
          height: "2px",
          backgroundColor: "#ccc",
        }}
      />

      {/* Skeleton Bars */}
      <div
        className="bar-rite d-flex align-items-end gap-3"
        style={{
          height: "90%",
          marginLeft: "40px", // leave space for Y-axis
        }}
      >
        {Array(value?.value)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="bg-secondary rounded"
              style={{
                width: "40px",
                height: `${Math.random() * 60 + 20}%`,
                animation: "pulse 1.5s infinite ease-in-out",
              }}
            />
          ))}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default ChartSkeleton;
