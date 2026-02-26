import React, { useEffect, useState } from "react";

import {
  UserOutlined,
  BankOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import PieChartAdmin from "./AdminPieChart";
import { Row, Col, Card, Radio } from "antd";
import AdminBarChart from "./AdminBarChart";
import AdminTenantChart from "./AdminTenantChart";

const DashboardAdminGraph = () => {
  const cardsData = [
    {
      title: "All Customers",
      value: 100,
      icon: <UserOutlined style={{ fontSize: "24px" }} />,
      subtitle1: "Individuals",
      value1: 200,
      subtitle2: "Business",
      value2: 300,
      cardType: "highlight",
    },
  ];

  const producer = [
    {
      title: "Total Producers",
      value: "1,200",
      icon: <BankOutlined style={{ fontSize: "24px" }} />,
      cardType: "default",
    },
    {
      title: "Total Vendors",
      value: "204",
      icon: <ShoppingCartOutlined style={{ fontSize: "24px" }} />,
      cardType: "default",
    },
  ];

  return (
    <>
      <div className="col-12 d-flex gap-1 px-4 p-2 mt-2">
        <div className="col-7">
          <div>Overview</div>
          <div className="d-flex mt-2">
            <div className="col-6 p-2">
              {cardsData.map((card: any, index: any) => (
                <div key={index}>
                  <div className="card-customer p-4 text-white">
                    <div className="d-flex justify-content-between ">
                      <div style={{ fontSize: "13px" }}>
                        {card.title}
                        <div
                          className="mt-2"
                          style={{ fontSize: "16px", fontWeight: 600 }}
                        >
                          {" "}
                          {card.value}
                        </div>
                      </div>
                      <div style={{ height: "26.67px" }}>{card.icon}</div>
                    </div>
                    <div className="d-flex justify-content-between mt-5">
                      <div style={{ fontSize: "13px" }}>{card.subtitle1}</div>
                      <div style={{ fontSize: "13px" }}>{card.subtitle2}</div>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <div
                        className="mt-2"
                        style={{ fontSize: "16px", fontWeight: 600 }}
                      >
                        {card.value1}
                      </div>
                      <div
                        className="mt-2"
                        style={{ fontSize: "16px", fontWeight: 600 }}
                      >
                        {card.value2}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-6 d-flex justify-content-between">
              {producer.map((card, index) => (
                <div className="col-6 p-2" key={index}>
                  <div className="card-product p-4 text-dark">
                    <div>{card.icon}</div>
                    <div className="mt-5">{card.title}</div>
                    <div className="mt-2">{card.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="d-flex mt-2">
            <div className="col-6 d-flex  justify-content-between">
              {producer.map((card, index) => (
                <div className="col-6 p-2" key={index}>
                  <div className="card-product p-4 text-dark">
                    <div>{card.icon}</div>
                    <div className="mt-5">{card.title}</div>
                    <div className="mt-2">{card.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-6 p-2">
              {cardsData.map((card: any, index: any) => (
                <div key={index}>
                  <div className="card-customer2 p-4 text-white">
                    <div className="d-flex justify-content-between ">
                      <div style={{ fontSize: "13px" }}>
                        {card.title}
                        <div
                          className="mt-2"
                          style={{ fontSize: "16px", fontWeight: 600 }}
                        >
                          {" "}
                          {card.value}
                        </div>
                      </div>
                      <div style={{ height: "26.67px" }}>{card.icon}</div>
                    </div>
                    <div className="d-flex justify-content-between mt-5">
                      <div style={{ fontSize: "13px" }}>{card.subtitle1}</div>
                      <div style={{ fontSize: "13px" }}>{card.subtitle2}</div>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <div
                        className="mt-2"
                        style={{ fontSize: "16px", fontWeight: 600 }}
                      >
                        {card.value1}
                      </div>
                      <div
                        className="mt-2"
                        style={{ fontSize: "16px", fontWeight: 600 }}
                      >
                        {card.value2}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-5 pie-admin-chart">
          <div style={{ width: "100%", height: "100%" }}>
            <div>Total Sales / Product-wise</div>
            <div className="mt-2" style={{ fontSize: "20px", fontWeight: 600 }}>
              SAR 155,240
            </div>
            <PieChartAdmin />
          </div>
        </div>
      </div>
      <div className="d-flex mt-3 col-12 px-4 p-2 gap-2">
        <div className="col-7 ">
          <Col>
            <Card>
              <div className="d-flex mb-3 border-bottom">
                <div className="col-2">
                  <h4>Revenu</h4>
                </div>
                <div className="d-flex col-10 align-items-center justify-content-end">
                  <Radio.Group
                    defaultValue="All"
                    buttonStyle="solid"
                    style={{ marginRight: "16px" }}
                  >
                    <Radio value="today">Today</Radio>
                    <Radio value="last-week">Last Week</Radio>
                    <Radio value="last-month">Last Month</Radio>
                    <Radio value="">Today</Radio>
                    <Radio value="last-week">Last Week</Radio>
                    <Radio value="last-month">Last Month</Radio>
                  </Radio.Group>
                </div>
              </div>
              <AdminBarChart />
            </Card>
          </Col>
        </div>
        <div className="col-5">
          <Col>
            <Card title="Finance">
              <AdminTenantChart />
            </Card>
          </Col>
        </div>
      </div>
    </>
  );
};

export default DashboardAdminGraph;
