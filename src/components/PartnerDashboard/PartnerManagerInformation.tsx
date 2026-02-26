import React from "react";

function PartnerManagerInformation({ setSelectedTab, packageDetails }: any) {
  const detailSections = [
    {
      heading: "English",
      align: "start", // for heading alignment
      details: [
        { label: "Customer ID", value: packageDetails?.order_number || "-" },
      ],
    },
    {
      heading: "عربي",
      align: "end",
      details: [
        { label: "شركة XXX المحدودة", value: packageDetails?.email || "-" },
      ],
    },
    {
      heading: "English",
      align: "start", // for heading alignment
      details: [
        { label: "Customer ID", value: packageDetails?.order_number || "-" },
        { label: "Customer Name", value: packageDetails?.customer_name || "-" },
        { label: "Order ID", value: packageDetails?.order_number || "-" },

        {
          label: "Order Status",
          value: (
            <span className="badge bg-success text-light">
              {packageDetails?.status}
            </span>
          ),
        },
      ],
    },
    {
      heading: "عربي",
      align: "end",
      details: [
        { label: "شركة XXX المحدودة", value: packageDetails?.email || "-" },
        { label: "Mobile No", value: packageDetails?.mobile_no || "-" },
        { label: "Order Date", value: packageDetails?.order_date || "-" },
      ],
    },
    {
      heading: "English",
      align: "start", // for heading alignment
      details: [
        { label: "Customer ID", value: packageDetails?.order_number || "-" },
        { label: "Customer Name", value: packageDetails?.customer_name || "-" },
        { label: "Order ID", value: packageDetails?.order_number || "-" },

        { label: "Customer ID", value: packageDetails?.order_number || "-" },
        { label: "Customer Name", value: packageDetails?.customer_name || "-" },
        { label: "Order ID", value: packageDetails?.order_number || "-" },
        { label: "Customer ID", value: packageDetails?.order_number || "-" },
        { label: "Customer Name", value: packageDetails?.customer_name || "-" },
        { label: "Order ID", value: packageDetails?.order_number || "-" },
        { label: "Customer ID", value: packageDetails?.order_number || "-" },
        { label: "Customer Name", value: packageDetails?.customer_name || "-" },
        { label: "Order ID", value: packageDetails?.order_number || "-" },
        { label: "Customer ID", value: packageDetails?.order_number || "-" },
        { label: "Customer Name", value: packageDetails?.customer_name || "-" },
        { label: "Order ID", value: packageDetails?.order_number || "-" },
        {
          label: "Order Status",
          value: (
            <span className="badge bg-success text-light">
              {packageDetails?.status}
            </span>
          ),
        },
      ],
    },
    {
      heading: "عربي",
      align: "end",
      details: [
        { label: "شركة XXX المحدودة", value: packageDetails?.email || "-" },
        { label: "Mobile No", value: packageDetails?.mobile_no || "-" },
        { label: "Order Date", value: packageDetails?.order_date || "-" },
        { label: "شركة XXX المحدودة", value: packageDetails?.email || "-" },
        { label: "Mobile No", value: packageDetails?.mobile_no || "-" },
        { label: "Order Date", value: packageDetails?.order_date || "-" },
        { label: "شركة XXX المحدودة", value: packageDetails?.email || "-" },
        { label: "Mobile No", value: packageDetails?.mobile_no || "-" },
        { label: "Order Date", value: packageDetails?.order_date || "-" },
        { label: "شركة XXX المحدودة", value: packageDetails?.email || "-" },
        { label: "Mobile No", value: packageDetails?.mobile_no || "-" },
        { label: "Order Date", value: packageDetails?.order_date || "-" },
        { label: "شركة XXX المحدودة", value: packageDetails?.email || "-" },
        { label: "Mobile No", value: packageDetails?.mobile_no || "-" },
        { label: "Order Date", value: packageDetails?.order_date || "-" },
      ],
    },
  ];

  return (
    <>
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              {detailSections.map((section, index) => (
                <div className="col-6" key={index}>
                  <h5
                    className={`d-flex justify-content-${section.align} mb-4 heading-cover`}
                  >
                    {section.heading}
                  </h5>
                  {section.details.map((detail, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center mt-2 mb-3"
                      style={{ borderBottom: "1px solid #CFCFCF" }}
                    >
                      <p
                        style={{
                          color: "#0B0B0B",
                          fontSize: "14px",
                          lineHeight: "1.5rem",
                        }}
                      >
                        {detail.label}
                      </p>
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#0B0B0B",
                          fontSize: "14px",
                        }}
                      >
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PartnerManagerInformation;
