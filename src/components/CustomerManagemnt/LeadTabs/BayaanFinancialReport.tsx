"use client"

import type React from "react"

import { Table, Card, Layout } from "antd"
import type { TableColumnsType } from "antd"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation("customerManagement")
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
      title: `${t("bayaan.col.item")} ↑↓`,
      dataIndex: "item",
      key: "item",
      sorter: true,
    },
    {
      title: `${t("common:date")} ↑↓`,
      dataIndex: "date",
      key: "date",
      align: "center",
      sorter: true,
    },
    {
      title: `${t("common:amount")} ↑↓`,
      dataIndex: "amount",
      key: "amount",
      align: "right",
      sorter: true,
    },
  ]

  // Table columns for board members
  const boardColumns: TableColumnsType<BoardMemberRow> = [
    {
      title: `${t("bayaan.col.personCompanyName")} ↑↓`,
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: `${t("bayaan.col.citizenshipCodeDescription")} ↑↓`,
      dataIndex: "citizenship",
      key: "citizenship",
      sorter: true,
    },
    {
      title: `${t("bayaan.col.role")} ↑↓`,
      dataIndex: "role",
      key: "role",
      sorter: true,
    },
    {
      title: `${t("bayaan.col.partnershipPercent")} ↑↓`,
      dataIndex: "partnership",
      key: "partnership",
      align: "right",
      sorter: true,
    },
  ]

  // Table columns for indicators
  const indicatorColumns: TableColumnsType<IndicatorRow> = [
    {
      title: `${t("bayaan.col.earningPerShare")} ↑↓`,
      dataIndex: "eps",
      key: "eps",
      sorter: true,
    },
    {
      title: `${t("bayaan.col.bookValuePerShare")} ↑↓`,
      dataIndex: "bvps",
      key: "bvps",
      align: "center",
      sorter: true,
    },
    {
      title: `${t("bayaan.col.investmentDepositPercent")} ↑↓`,
      dataIndex: "investmentDeposit",
      key: "investmentDeposit",
      align: "center",
      sorter: true,
    },
    {
      title: `${t("bayaan.col.factoringDepositPercent")} ↑↓`,
      dataIndex: "factoringDeposit",
      key: "factoringDeposit",
      align: "center",
      sorter: true,
    },
    {
      title: `${t("bayaan.col.returnOnEquityPercent")} ↑↓`,
      dataIndex: "roe",
      key: "roe",
      align: "center",
      sorter: true,
    },
    {
      title: `${t("bayaan.col.returnOnAssetsPercent")} ↑↓`,
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
            {t("bayaan.section.companyInformation")}
          </h2>

          {/* Company Information Subsection */}
          <div style={subsectionStyle}>
            <h3 style={sectionTitleStyle}>{t("bayaan.section.companyInformation")}</h3>
            <div style={gridContainerStyle}>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.commercialRegistrationNumber")}</span>
                  <span style={valueStyle}>1743798589</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.address")}</span>
                  <span style={valueStyle}>Riyadh, Al-Malaz District</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.nationalityOfCr")}</span>
                  <span style={valueStyle}>Saudi Arabia</span>
                </div>
              </div>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.zipCode")}</span>
                  <span style={valueStyle}>000140</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.city")}</span>
                  <span style={valueStyle}>Riyadh</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("common:phone")}</span>
                  <span style={valueStyle}>291510</span>
                </div>
              </div>
            </div>
          </div>

          {/* General Information Subsection */}
          <div style={subsectionStyle}>
            <h3 style={sectionTitleStyle}>{t("bayaan.section.generalInformation")}</h3>
            <div style={gridContainerStyle}>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.crType")}</span>
                  <span style={valueStyle}>Main CR</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.companyName")}</span>
                  <span style={valueStyle}>Bank Albilad</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.legalEntity")}</span>
                  <span style={valueStyle}>Individual Establishment</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.crExpiryDate")}</span>
                  <span style={valueStyle}>03-10-1447</span>
                </div>
              </div>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.commercialRegistrationNumber")}</span>
                  <span style={valueStyle}>1743798589</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.crStatus")}</span>
                  <span style={valueStyle}>Active</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.crIssuanceDate")}</span>
                  <span style={valueStyle}>03-10-1426</span>
                </div>
              </div>
            </div>
          </div>

          {/* Capital Information Subsection */}
          <div>
            <h3 style={sectionTitleStyle}>{t("bayaan.section.capitalInformation")}</h3>
            <div style={gridContainerStyle}>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.creditCard")}</span>
                  <span style={valueStyle}>SAR</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.authorizedCapital")}</span>
                  <span style={valueStyle}>7,500,000,000</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.totalSharesNumber")}</span>
                  <span style={valueStyle}>750,000,000</span>
                </div>
              </div>
              <div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.currency")}</span>
                  <span style={valueStyle}>Saudi Riyal</span>
                </div>
                <div style={fieldRowStyle}>
                  <span style={labelStyle}>{t("bayaan.field.paidupCapital")}</span>
                  <span style={valueStyle}>7,500,000,000</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
  {/* Financial Indicators & Board Section */}
        <Card style={companyInfoCardStyle}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "24px", color: "var(--foreground)",textAlign:"left" }}>
            {t("bayaan.section.financialIndicators")}
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
              {t("bayaan.section.boardMembers")}
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
            {t("bayaan.section.financialStatements")}
          </h2>

          {/* Financial Positions */}
          <div style={tableContainerStyle}>
            <h3 style={sectionTitleStyle}>{t("bayaan.section.financialPositions")}</h3>
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
            <h3 style={sectionTitleStyle}>{t("bayaan.section.incomeStatement")}</h3>
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
            {t("bayaan.section.cashFlowStatement")}
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
            {t("bayaan.section.comprehensiveIncome")}
          </h2>

          {/* Comprehensive Income */}
          <div style={tableContainerStyle}>
            <h3 style={sectionTitleStyle}>{t("bayaan.section.comprehensiveIncome")}</h3>
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
            <h3 style={sectionTitleStyle}>{t("bayaan.section.changesInEquity")}</h3>
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
