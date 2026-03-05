"use client"

import type React from "react"

import { Table, Card, Layout } from "antd"
import type { TableColumnsType } from "antd"

const { Content } = Layout

interface FinancialRow {
  key: string
  item: string
  date: string
  amount: string
}

interface BoardMemberRow {
  key: string
  name: string
  citizenship: string
  role: string
  partnership: string
}

interface IndicatorRow {
  key: string
  eps: string
  bvps: string
  investmentDeposit: string
  factoringDeposit: string
  roe: string
  roa: string
}

export default function BayaanFinancialReport() {
  // Financial data
  const financialData: FinancialRow[] = Array.from({ length: 10 }, (_, i) => ({
    key: `${i}`,
    item: i % 2 === 0 ? "Customer Deposits" : "Share Capital",
    date: i % 2 === 0 ? "13-02-2024" : "15-02-2024",
    amount: i % 2 === 0 ? "75,000,000,000" : "15,000,000",
  }))

  // Board members data
  const boardMembersData: BoardMemberRow[] = Array.from({ length: 9 }, (_, i) => ({
    key: `${i}`,
    name: i % 2 === 0 ? "Nasser Mohammed Al-Subaie (Vice-President)" : "Sameer Mohammed (Chairman of the Council)",
    citizenship: "Saudi Arabia",
    role: i % 2 === 0 ? "Board Member" : "Manager",
    partnership: "0",
  }))

  // Financial indicators data
  const indicatorsData: IndicatorRow[] = [
    {
      key: "1",
      eps: "N/A",
      bvps: "N/A",
      investmentDeposit: "6.99%",
      factoringDeposit: "81.21%",
      roe: "12.24%",
      roa: "1.54%",
    },
  ]

  const financialColumns: TableColumnsType<FinancialRow> = [
    {
      title: "Item ↑↓",
      dataIndex: "item",
      key: "item",
      sorter: true,
    },
    {
      title: "Date ↑↓",
      dataIndex: "date",
      key: "date",
      align: "center",
      sorter: true,
    },
    {
      title: "Amount ↑↓",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      sorter: true,
    },
  ]

  // Table columns for board members
  const boardColumns: TableColumnsType<BoardMemberRow> = [
    {
      title: "Person / Company Name ↑↓",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Citizenship Code Description ↑↓",
      dataIndex: "citizenship",
      key: "citizenship",
      sorter: true,
    },
    {
      title: "Role ↑↓",
      dataIndex: "role",
      key: "role",
      sorter: true,
    },
    {
      title: "Partnership % ↑↓",
      dataIndex: "partnership",
      key: "partnership",
      align: "right",
      sorter: true,
    },
  ]

  // Table columns for indicators
  const indicatorColumns: TableColumnsType<IndicatorRow> = [
    {
      title: "Earning Per Share ↑↓",
      dataIndex: "eps",
      key: "eps",
      sorter: true,
    },
    {
      title: "Book Value Per Share ↑↓",
      dataIndex: "bvps",
      key: "bvps",
      align: "center",
      sorter: true,
    },
    {
      title: "Investment / Deposit % ↑↓",
      dataIndex: "investmentDeposit",
      key: "investmentDeposit",
      align: "center",
      sorter: true,
    },
    {
      title: "Factoring / Deposit % ↑↓",
      dataIndex: "factoringDeposit",
      key: "factoringDeposit",
      align: "center",
      sorter: true,
    },
    {
      title: "Return on Equity % ↑↓",
      dataIndex: "roe",
      key: "roe",
      align: "center",
      sorter: true,
    },
    {
      title: "Return on Assets % ↑↓",
      dataIndex: "roa",
      key: "roa",
      align: "center",
      sorter: true,
    },
  ]

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "var(--color-surface-subtle)",
    padding: "32px",
  }

  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--background)",
    borderRadius: "0px",
    boxShadow: "none",
    border: "none",
  }

  const companyInfoCardStyle: React.CSSProperties = {
    ...cardStyle,
    borderBottom: "1px solid var(--color-surface-pressed)",
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 700,
    color: "var(--foreground)",
    marginBottom: "16px",
    borderBottom: "1px solid var(--color-surface-pressed)",
    paddingBottom: "12px",
    textAlign:"left"
  }

  const subsectionStyle: React.CSSProperties = {
    marginBottom: "32px",
  }

  const gridContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
  }

  const fieldRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid var(--color-surface-muted)",
  }

  const labelStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "var(--color-text-muted)",
  }

  const valueStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--foreground)",
  }

  const tableContainerStyle: React.CSSProperties = {
    marginBottom: "24px",
  }

  const tableStyle: React.CSSProperties = {
    backgroundColor: "var(--background)",
  }

  return (
    <div >
      <div style={contentStyle}>
        {/* Company Information Section */}
        <Card style={companyInfoCardStyle}>
          <h2 style={{ textAlign:"left",fontSize: "16px", fontWeight: 700, marginBottom: "24px", color: "var(--foreground)" }}>
            Company Information
          </h2>

          {/* Company Information Subsection */}
          <div style={subsectionStyle}>
            <h3 style={sectionTitleStyle}>Company Information</h3>
            <div style={gridContainerStyle}>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Commercial Registration Number</span>
                  <span style={valueStyle}>1743798589</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Address</span>
                  <span style={valueStyle}>Riyadh, Al-Malaz District</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Nationality of Commercial Registration</span>
                  <span style={valueStyle}>Saudi Arabia</span>
                </div>
              </div>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Zip Code</span>
                  <span style={valueStyle}>000140</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>City</span>
                  <span style={valueStyle}>Riyadh</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Phone</span>
                  <span style={valueStyle}>291510</span>
                </div>
              </div>
            </div>
          </div>

          {/* General Information Subsection */}
          <div style={subsectionStyle}>
            <h3 style={sectionTitleStyle}>General Information</h3>
            <div style={gridContainerStyle}>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Commercial Registration Type</span>
                  <span style={valueStyle}>Main CR</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Company Name</span>
                  <span style={valueStyle}>Bank Albilad</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Legal Entity</span>
                  <span style={valueStyle}>Individual Establishment</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Commercial Registration Expiry Date</span>
                  <span style={valueStyle}>03-10-1447</span>
                </div>
              </div>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Commercial Registration Number</span>
                  <span style={valueStyle}>1743798589</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Commercial Registration Status</span>
                  <span style={valueStyle}>Active</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Date of Issuance of Commercial Registration</span>
                  <span style={valueStyle}>03-10-1426</span>
                </div>
              </div>
            </div>
          </div>

          {/* Capital Information Subsection */}
          <div>
            <h3 style={sectionTitleStyle}>Capital Information</h3>
            <div style={gridContainerStyle}>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Credit Card</span>
                  <span style={valueStyle}>SAR</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Authorized Capital</span>
                  <span style={valueStyle}>7,500,000,000</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Total Shares Number</span>
                  <span style={valueStyle}>750,000,000</span>
                </div>
              </div>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Currency</span>
                  <span style={valueStyle}>Saudi Riyal</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>Paidup Capital</span>
                  <span style={valueStyle}>7,500,000,000</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
  {/* Financial Indicators & Board Section */}
        <Card style={companyInfoCardStyle}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "24px", color: "var(--foreground)",textAlign:"left" }}>
            Financial Indicators
          </h2>

          {/* Financial Indicators - 2015 */}
          <div style={tableContainerStyle}>
            <h3 style={sectionTitleStyle}>2015</h3>
            <Table
              columns={indicatorColumns}
              dataSource={indicatorsData}
              pagination={false}
              bordered={false}
              size="small"
              style={tableStyle}
              rowClassName={() => ""}
            />
          </div>

          {/* Members of the Board of Directors */}
          <div>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "var(--foreground)",
                borderBottom: "1px solid var(--color-surface-pressed)",
                paddingBottom: "12px",
                textAlign:"left"
              }}
            >
              Members of the Boards of Directors
            </h2>
            <Table
              columns={boardColumns}
              dataSource={boardMembersData}
              pagination={false}
              bordered={false}
              size="small"
              style={tableStyle}
              rowClassName={() => ""}
            />
          </div>
        </Card>
        {/* Financial Statements Section */}
        <Card style={cardStyle}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "24px",
              color: "var(--foreground)",
              borderBottom: "1px solid var(--color-surface-pressed)",
              paddingBottom: "12px",
              textAlign:"left"
            }}
          >
            Financial Statements
          </h2>

          {/* Financial Positions */}
          <div style={tableContainerStyle}>
            <h3 style={sectionTitleStyle}>Financial Positions</h3>
            <Table
              columns={financialColumns}
              dataSource={financialData}
              pagination={false}
              bordered={false}
              size="small"
              style={tableStyle}
              rowClassName={() => ""}
            />
          </div>

          {/* Income Statement */}
          <div style={tableContainerStyle}>
            <h3 style={sectionTitleStyle}>Income Statement</h3>
            <Table
              columns={financialColumns}
              dataSource={financialData}
              pagination={false}
              bordered={false}
              size="small"
              style={tableStyle}
              rowClassName={() => ""}
            />
          </div>
        </Card>

        {/* Cash Flow Statement Section */}
        <Card style={cardStyle}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "24px",
              color: "var(--foreground)",
              borderBottom: "1px solid var(--color-surface-pressed)",
              paddingBottom: "12px",
              textAlign:"left"
            }}
          >
            Cash Flow Statement
          </h2>
          <Table
            columns={financialColumns}
            dataSource={financialData}
            pagination={false}
            bordered={false}
            size="small"
            style={tableStyle}
            rowClassName={() => ""}
          />
        </Card>

        {/* Comprehensive Income Section */}
        <Card style={cardStyle}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "24px",
              color: "var(--foreground)",
              borderBottom: "1px solid var(--color-surface-pressed)",
              paddingBottom: "12px",
              textAlign:"left"
            }}
          >
            Comprehensive Income
          </h2>

          {/* Comprehensive Income */}
          <div style={tableContainerStyle}>
            <h3 style={sectionTitleStyle}>Comprehensive Income</h3>
            <Table
              columns={financialColumns}
              dataSource={financialData}
              pagination={false}
              bordered={false}
              size="small"
              style={tableStyle}
              rowClassName={() => ""}
            />
          </div>

          {/* Changes in Equity */}
          <div style={tableContainerStyle}>
            <h3 style={sectionTitleStyle}>Changes in Equity</h3>
            <Table
              columns={financialColumns}
              dataSource={financialData}
              pagination={false}
              bordered={false}
              size="small"
              style={tableStyle}
              rowClassName={() => ""}
            />
          </div>
        </Card>

      
      </div>
    </div>
  )
}
