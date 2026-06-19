import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
const TableViewTanenent = ({ header, data, apiHeader }: any) => {
  const [table, setTable] = useState<any>();

  const themeBuilder = useSelector((state: RootState) => state.block.theme);

  useEffect(() => {}, []);
  const customStyles = {
    rows: {
      style: {
        minHeight: "38px",
      },
    },
    headCells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
        justifyContent: "center",
        alignItems: "center",
        background: "red",
        color: "#FFFFFF",
        fontSize: "16px",
        fontWeight: "600",
      },
    },
    cells: {
      style: {
        paddingLeft: "8px", // override the cell padding for data cells
        paddingRight: "8px",
        fontSize: "12px",
        borderTopLeftRadius: "2px",
        justifyContent: "center", // Center the content horizontally
        alignItems: "center", // Center the content vertically (if needed)
      },
    },
    // pagination: {
    //   style: {
    //     // Customize the pagination container style
    //     display: "flex",
    //     justifyContent: "flex-end",
    //     alignItems: "center",
    //     padding: "10px",
    //   },
    //   pageButtonsStyle: {
    //     // Customize the individual page buttons style
    //     borderRadius: "2px",
    //     marginLeft: "5px",
    //     marginRight: "5px",
    //     padding: "8px",
    //     color: "white",
    //     backgroundColor: "#004D72",
    //     "&:hover": {
    //       backgroundColor: "#005587",
    //     },
    //   },
    //   currentPageStyle: {
    //     // Customize the current page indicator style
    //     color: "#004D72",
    //     fontWeight: "bold",
    //   },
    //   rowsPerPageDropdownStyle: {
    //     // Customize the rows per page dropdown style
    //     backgroundColor: "#004D72",
    //     color: "white",
    //     borderRadius: "2px",
    //     border: "1px solid #004D72",
    //   },
    // },
  };
  // const hasMeaningfulData = data.some((item: any) =>
  //   Object.values(item).some((value) => value !== "")
  // );

  const noDataComponent = data ? null : (
    <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
      No data available
    </div>
  );

  useEffect(() => {
    const parsedColumns =
      apiHeader &&
      apiHeader.map((column: any) => {
        if (typeof column.selector === "string") {
          try {
            // Use Function constructor instead of eval for better security
            const renderFunction = new Function(`return ${column.selector}`)();
            column.selector = renderFunction;
          } catch (error) {
            console.error("Error parsing render function:", error);
          }
        }
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
                  borderRadius: "2px",
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
              <>
                <div className="d-flex">
                  {column.editTitle && (
                    <div
                      style={{
                        padding: ".25rem 0.5rem",
                        borderRadius: "2px",
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
                        borderRadius: "2px",
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
                        borderRadius: "2px",
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
                        borderRadius: "2px",
                        backgroundColor: themeBuilder?.table?.backgroundColor,
                        color: themeBuilder?.table?.headingColor,
                        cursor: row.Status === "Active" ? "pointer" : "default",
                      }}
                    >
                      {column.defaultTitle}
                    </div>
                  )}
                </div>
              </>
            ),
          };
        }
        return column;
      });

    setTable(parsedColumns);
  }, [apiHeader]);

  // Handle save button click
  // const handleSaveClick = (rowId) => {
  //   const newData = data.map((row) =>
  //     row.id === rowId ? { ...row, ...editFormData } : row
  //   );
  //   setData(newData);
  //   setEditRowId(null);
  // };

  return (
    <>
      <DataTable
        columns={header}
        data={data}
        customStyles={customStyles}
        noDataComponent={noDataComponent}
        keyField="id"
      />
    </>
  );
};

export default TableViewTanenent;
