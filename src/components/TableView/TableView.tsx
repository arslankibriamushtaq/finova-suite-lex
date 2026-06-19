import React, { useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { Dropdown } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaSearch } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

import { Images } from "../Config/Images";
import { Select } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";

// Mock theme styles

const TableView = ({
  header,
  data,
  apiHeader,
  setPageSize,
  setPage,
  pageSize,
  page,
  totalRows,
  totalPage,
  paginationShow = true,
  searchFields = [],
  isLoading = false,
  skelitonLength,
  paginationRowsPerPageOptions = [5, 10, 15, 20],
  from,
  to,
  endpoint,
}: any) => {
  const [table, setTable] = useState<any>();
  const location = useLocation();
  const isViewPage = location.pathname.includes(
    "/FinancingApplications/AllApplications/View/"
  );
  const conditionalStyles = isViewPage ? { display: "none" } : {};
  const borderStyle = isViewPage ? { borderRadius: "6px" } : {};
  const customStyles = {
    rows: {
      style: {
        minHeight: "32px",
        padding: "0px 10px",
        borderBottom: "1px solid var(--surface-border)",
        backgroundColor: "var(--surface-card)",
        color: "var(--foreground)",
        "&:last-of-type": {
          borderBottom: "none",
        },
        "&:hover": {
          backgroundColor: "var(--theme-table-row-hover)",
        },
      },
      stripedStyle: {
        backgroundColor: "var(--theme-table-row-alt)",
        color: "var(--foreground)",
      },
    },
    table: {
      style: {
        backgroundColor: "var(--surface-card)",
        background: "var(--surface-card)",
        color: "var(--foreground)",
      },
    },
    tableWrapper: {
      style: {
        backgroundColor: "var(--surface-card)",
        background: "var(--surface-card)",
      },
    },
    head: {
      style: {
        backgroundColor: "var(--theme-table-background-color)",
        background: "var(--theme-table-background-color)",
        minHeight: "34px",
        zIndex: 1,
      },
    },
    headRow: {
      style: {
        backgroundColor: "var(--theme-table-background-color)",
        background: "var(--theme-table-background-color)",
        border: "none",
        minHeight: "34px",
      },
    },
    pagination: {
      style: {
        backgroundColor: "var(--surface-card)",
        color: "var(--foreground)",
        borderTop: "1px solid var(--surface-border)",
      },
    },
    noData: {
      style: {
        backgroundColor: "var(--surface-card)",
        background: "var(--surface-card)",
        color: "var(--muted-foreground)",
        padding: "32px 16px",
        textAlign: "center",
      },
    },
    progress: {
      style: {
        backgroundColor: "var(--surface-card)",
        color: "var(--foreground)",
      },
    },
    subHeader: {
      style: {
        backgroundColor: "var(--surface-card)",
        color: "var(--foreground)",
      },
    },
    headCells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "6px",
        paddingBottom: "6px",
        justifyContent: "start",
        alignItems: "center",
        background: "var(--theme-table-background-color)",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "600",
        letterSpacing: "0.2px",
        textTransform: "none",
        whiteSpace: "nowrap",
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "6px",
        paddingBottom: "6px",
        fontSize: "12px",
        color: "var(--foreground)",
        fontWeight: "500",
        letterSpacing: "0.1px",
        justifyContent: "start",
        alignItems: "center",
        whiteSpace: "nowrap",
      },
    },
  };

  // Measure rendered text width so each column can show its full content on a
  // single line (no wrapping, no clipping).
  const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const measureText = (text: string, weight = 500) => {
    if (!measureCanvasRef.current && typeof document !== "undefined") {
      measureCanvasRef.current = document.createElement("canvas");
    }
    const ctx = measureCanvasRef.current?.getContext("2d");
    if (!ctx) return text.length * 8;
    ctx.font = `${weight} 12px Inter, -apple-system, "Segoe UI", Roboto, sans-serif`;
    return ctx.measureText(text).width;
  };

  // Widest rendered line inside a cell value, including JSX (spans/divs). Stacked
  // children (flex-col like "Cur / Req") are treated as separate lines (max),
  // so the column is sized to its widest line, not the concatenation.
  const measureNodeWidth = (node: any, weight = 500): number => {
    if (node === null || node === undefined || typeof node === "boolean") return 0;
    if (typeof node === "string" || typeof node === "number") {
      return measureText(String(node), weight);
    }
    if (Array.isArray(node)) {
      return node.reduce((m, c) => Math.max(m, measureNodeWidth(c, weight)), 0);
    }
    if (typeof node === "object" && node.props) {
      return measureNodeWidth(node.props.children, weight);
    }
    return 0;
  };

  // Make every table responsive: drop the fixed `width` (which, with nowrap
  // content, caused columns to overlap) and instead size each column to its
  // widest content so the full value shows on one line; the table grows and
  // scrolls horizontally when needed. Applies to every page via TableView.
  const responsiveColumns = (header || []).map((col: any) => {
    if (!col || typeof col !== "object") return col;
    // Strip ALL width constraints from the source column — no fixed/min/max width.
    const { width, minWidth, maxWidth, ...rest } = col;
    const headerText = typeof rest.name === "string" ? rest.name : "";
    let contentW = headerText ? measureText(headerText, 600) : 0;
    let measuredBody = false;
    (data || []).forEach((row: any) => {
      let w = 0;
      try {
        if (typeof rest.selector === "function") {
          const sv = rest.selector(row);
          if (sv !== null && sv !== undefined) w = measureText(String(sv), 500);
        } else if (typeof rest.cell === "function") {
          w = measureNodeWidth(rest.cell(row), 500);
        }
      } catch {
        /* unmeasurable cell — falls back to default width below */
      }
      if (w > 0) {
        measuredBody = true;
        contentW = Math.max(contentW, w);
      }
    });
    // Content-fit MINIMUM width (text + padding + buffer for monospace/icons).
    // Using minWidth (not a fixed width) + grow lets columns expand to fill the
    // container — so there's no empty space on the right — while never shrinking
    // below their content, so nothing overlaps. No max width is set.
    const colMinWidth = measuredBody
      ? `${Math.ceil(contentW) + 44}px`
      : width || "140px";
    return {
      ...rest,
      minWidth: colMinWidth,
      grow: rest.grow ?? 1,
    };
  });
  const noDataComponent =
    !isLoading && (!data || data.length === 0) ? (
      <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
        {/* No data available */}
      </div>
    ) : null;
  useEffect(() => {
    const parsedColumns =
      apiHeader &&
      apiHeader.map((column: any) => {
        if (typeof column.selector === "string") {
          try {
            const renderFunction = new Function(`return ${column.selector}`)();
            column.selector = renderFunction;
          } catch (error) {
            console.error("Error parsing render function:", error);
          }
        }
        // if (column.selector === "logo") {
        //   // Ensure that the logo column renders the image
        //   return {
        //     ...column,
        //     cell: (row: any) => (
        //       <img
        //         src={`${import.meta.env.VITE_REACT_APP_API_BASE_URL}${row.logo}`}
        //         alt="Product Logo"
        //         style={{ width: "50px", height: "50px", objectFit: "contain" }}
        //       />
        //     ),
        //   };
        // }


        if (column.type === "list") {
          return {
            ...column,
            cell: (row: any) => (
              <div>
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                    Select
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {row.actionList &&
                      row.actionList.map((item: any, index: any) => (
                        <Dropdown.Item key={index}>
                          <Link to={`${item.Link}`} className="a-link">
                            <div className="d-flex">
                              <div className="col-2">
                                <img src={item.img} alt="" />
                              </div>

                              <div className="col-10">{item.label}</div>
                            </div>
                          </Link>
                        </Dropdown.Item>
                      ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ),
          };
        }
        if (column.type == "color") {
          return {
            ...column,
            cell: (row: any) => (
              <div
                style={{
                  padding: "0.22rem 1rem",
                  borderRadius: "6px",
                  backgroundColor: column.backGround,
                  color: column.color,
                  cursor: row.ByDefault === "Active" ? "pointer" : "default",
                }}
              >
                {column.selector(row)}
              </div>
            ),
          };
        }
        if (column.type === "button") {
          return {
            ...column,
            cell: (row: any) => (
              <div className="d-flex">
                {column.editTitle && (
                  <div
                    style={{
                      padding: ".25rem 0.5rem",
                      borderRadius: "6px",
                      backgroundColor: "#0dcaf0",
                      color: "white",
                      marginRight: "4px",
                    }}
                  >
                    {column.editTitle}
                  </div>
                )}
                {column.updateTitle && (
                  <div
                    style={{
                      padding: ".25rem 0.5rem",
                      borderRadius: "6px",
                      backgroundColor: "#4253a1",
                      color: "white",
                      marginRight: "4px",
                    }}
                  >
                    {column.updateTitle}
                  </div>
                )}
                {column.deleteTitle && (
                  <div
                    style={{
                      padding: ".25rem 0.5rem",
                      borderRadius: "6px",
                      backgroundColor: "#000000",
                      color: "white",
                      marginRight: "4px",
                    }}
                  >
                    {column.deleteTitle}
                  </div>
                )}
                {column.defaultTitle && (
                  <div
                    style={{
                      padding: "0.22rem 1rem",
                      borderRadius: "6px",
                      backgroundColor: "var(--theme-table-background-color)",
                      color: "var(--theme-table-heading-color)",
                      cursor: row.Status === "Active" ? "pointer" : "default",
                    }}
                  >
                    {column.defaultTitle}
                  </div>
                )}
              </div>
            ),
          };
        }
        return column;
      });

    setTable(parsedColumns);
  }, [apiHeader]);

  const handlePerChange = (newPerPage: number) => {
    setPageSize(newPerPage); // Call the parent handler to update pageSize
    setPage(1); // Reset to the first page
  };

  const handlePage = (newPage: number) => {
    setPage(newPage); // Call the parent handler to update page
  };

  const TableSkeleton = () => (
    <div
      className="skeleton-table"
      style={{ border: "1px solid #e0e0e0", borderRadius: "6px" }}
    >
      <div
        className="skeleton-header"
        style={{
          display: "flex",
          borderBottom: "2px solid #e0e0e0",
          background: "#f0f0f0",
          borderRadius: "6px 6px 0 0",
        }}
      >
        {header.map((column: any, index: number) => (
          <div
            key={index}
            style={{ flex: column.width || 1, padding: "12px 8px" }}
          >
            <Skeleton height={20} />
          </div>
        ))}
      </div>
      <div className="skeleton-body">
        {[...Array(skelitonLength ? skelitonLength : 8)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="skeleton-row"
            style={{ display: "flex", borderBottom: "1px solid #e0e0e0" }}
          >
            {header.map((column: any, colIndex: number) => (
              <div
                key={colIndex}
                style={{ flex: column.width || 1, padding: "12px 8px" }}
              >
                <Skeleton height={20} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
  // const CustomSortIcon = ({
  //   sortDirection,
  // }: {
  //   sortDirection?: "asc" | "desc";
  // }) => {
  //   if (!sortDirection)
  //     return <img src={Images.arrowUpDown} style={{ opacity: 0.3 }} />; // Default icon
  //   return sortDirection === "asc" ? (
  //     <img src={Images.BlackIcon} style={{ opacity: 0.3 }} />
  //   ) : (
  //     <img src={Images.BlackIcon} style={{ opacity: 0.3 }} />
  //   );
  // };
  // const handlePerChange = (value: number) => setPageSize(value);
  const handlePageChange = (newPage: number) => setPage(newPage);

  // const filteredData = data.filter((item: any) =>
  //   searchFields.some((field: string) =>
  //     item[field]?.toString().toLowerCase().includes(searchText.toLowerCase())
  //   )
  // );
  const totalPages = Math.ceil(totalRows / pageSize);
  return (
    <>
      {searchFields && searchFields?.length > 0 && (
        <div className="d-flex justify-content-end mb-2 py-2">
          <div
            className="d-flex align-items-center gap-1 border px-2 ps-3"
            style={{ borderRadius: "6px" }}
          >
            <FaSearch />
            <input
              type="text"
              style={{ width: "300px", border: "none", outline: "none" }}
              className="p-2"
              placeholder="Search"
            />
          </div>
        </div>
      )}
      <div className="thisTable" style={borderStyle}>
        {isLoading && <TableSkeleton />}

        {!isLoading && (
          <>
            <DataTable
              pagination={false}
              paginationServer
              responsive
              columns={responsiveColumns}
              data={data}
              striped
              paginationTotalRows={totalRows}
              customStyles={customStyles}
              paginationRowsPerPageOptions={paginationRowsPerPageOptions}
              paginationPerPage={pageSize} // Use the prop for rows per page
              paginationDefaultPage={page} // Use the prop for current page
              onChangeRowsPerPage={handlePerChange} // Update rows per page
              onChangePage={handlePage} // Update current page
              keyField="id"
              noDataComponent={noDataComponent}
            // defaultSortFieldId={1}
            // sortIcon={<CustomSortIcon />}
            />
            {data?.length === 0 && (
              <div className="no-data-message">No data available</div>
            )}
            {endpoint && <div className="no-data-message">No APIs Enabled</div>}

            {paginationShow && (
              <div className="pagination-div" style={conditionalStyles}>
                <div className="d-flex col-12  align-items-center">
                  <div className="col-6">
                    <span>
                      Showing {`${from}`} to {`${to}`} of {`${totalRows}`}{" "}
                      entries
                    </span>
                    <Select
                      defaultValue={pageSize}
                      onChange={handlePerChange}
                      style={{ width: 80 }}
                    >
                      {[5, 10, 15, 20].map((size) => (
                        <Select.Option key={size} value={size}>
                          {size}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-6 gap-2 d-flex justify-content-end">
                    {(() => {
                      const btnStyle = (isActive = false) => ({
                        backgroundColor: isActive ? '#10b981' : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--theme-table-body-text-color, #000)',
                        border: isActive ? '1px solid #10b981' : '1px solid #dee2e6',
                        minWidth: '35px',
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        fontWeight: isActive ? '600' : '400',
                        padding: '0',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      });

                      return (
                        <>
                          <style>{`
                              .pagination-btn-active {
                                background-color: #10b981 !important;
                                color: #ffffff !important;
                                border-color: #10b981 !important;
                              }
                            `}</style>
                          <button
                            className="invoice-btn"
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            style={btnStyle() as any}
                          >
                            {<FontAwesomeIcon icon={faAnglesLeft} />}
                          </button>
                          <button
                            className="invoice-btn"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            style={btnStyle() as any}
                          >
                            {`<`}
                          </button>

                          {/* Render page numbers */}
                          {Array.from({ length: Math.min(5, totalPage) }, (_, i) => {
                            let pageNum;
                            if (totalPage <= 5) {
                              pageNum = i + 1;
                            } else if (page <= 3) {
                              pageNum = i + 1;
                            } else if (page >= totalPage - 2) {
                              pageNum = totalPage - 4 + i;
                            } else {
                              pageNum = page - 2 + i;
                            }

                            const isActive = page === pageNum;
                            return (
                              <button
                                key={pageNum}
                                className={`invoice-btn ${isActive ? 'pagination-btn-active' : ''}`}
                                onClick={() => setPage(pageNum)}
                                style={btnStyle(isActive) as any}
                              >
                                {pageNum}
                              </button>
                            );
                          })}

                          <button
                            className="invoice-btn"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPage || totalPage === 0}
                            style={btnStyle() as any}
                          >
                            {`>`}
                          </button>
                          <button
                            className="invoice-btn"
                            onClick={() => setPage(totalPage)}
                            disabled={page === totalPage || totalPage === 0}
                            style={btnStyle() as any}
                          >
                            {<FontAwesomeIcon icon={faAngleDoubleRight} />}
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default TableView;
