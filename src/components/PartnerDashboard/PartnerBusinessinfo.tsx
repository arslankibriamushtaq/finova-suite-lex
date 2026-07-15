import React from "react";
import { useTranslation } from "react-i18next";

function PartnerBusinessinfo({ setSelectedTab, packageDetails }: any) {
  const { t } = useTranslation("partner");
  const customerDetails = [
    { label: t("businessInfo.crName"), value: packageDetails?.customer_name || "-" },
    { label: t("businessInfo.crNumber"), value: packageDetails?.cr_number || "-" },
    { label: t("businessInfo.issueDate"), value: packageDetails?.issue_date || "-" },
    { label: t("businessInfo.expiryDate"), value: packageDetails?.expiry_date || "-" },
    { label: t("businessInfo.isEcommerce"), value: packageDetails?.is_ecommerce || "-" },
    {
      label: t("businessInfo.unifiedNationalNumber"),
      value: packageDetails?.unified_national_number || "-",
    },
  ];

  const additionalDetails = [
    { label: "اسم المنشأة", value: packageDetails?.email || "-" },
    { label: "رقم السجل التجاري", value: packageDetails?.mobile_no || "-" },
    { label: "تاريخ اصدار السجل", value: packageDetails?.order_date || "-" },
    { label: "تاريخ انتهاء السجل", value: packageDetails?.expiry_date || "-" },
    { label: "هي تجارة إلكترونية", value: packageDetails?.isEcommerce || "-" },
    {
      label: "الرقم الموحد",
      value: packageDetails?.unifiedNationalNumber || "-",
    },
  ];

  const detailSections = [
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
  ];

  return (
    <>
      <div className="profile-sec mt-3 mb-3">
        <div className="row g-3 align-items-center account-card">
          <div className="col-12">
            <div className="row p-3">
              <div className="col-6">
                <h5 className="mb-4">English</h5>
                {customerDetails.map((detail, index) => (
                  <div
                    key={index}
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

              <div className="col-6">
                <h5 className="d-flex justify-content-end mb-4 ">عربي</h5>
                {additionalDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center mt-2 mb-3"
                    style={{ borderBottom: "1px solid #CFCFCF" }}
                  >
                    <span
                      style={{
                        color: "#0B0B0B",
                        fontSize: "14px",
                      }}
                    >
                      {detail.value}
                    </span>
                    <p
                      style={{
                        color: "#0B0B0B",
                        fontSize: "14px",
                        fontWeight: "600",
                        lineHeight: "1.5rem",
                      }}
                    >
                      {detail.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
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

export default PartnerBusinessinfo;
