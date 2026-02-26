import { useSelector } from "react-redux";
import { createGlobalStyle } from "styled-components";
import TableView from "../../components/TableView/TableView";
import { RootState } from "../../redux/rootReducer";

const data = [
  {
    ApplicationNo: "ytf",
    customerName: "ejuir",
    phoneNo: "1234",
    date: "1234",
    amount: "1234",
    parentStatus: "56478",
    status: "4677",
    Action: "2356",
  },
];

const RecentApplication = (props: any) => {
  const themeBuilder = useSelector((state: RootState) => state.block.theme);

  const tableData = Array.isArray(props?.data?.data) ? props.data.data : [];
  const tableHeader = Array.isArray(props?.data?.header)
    ? props.data.header
    : [];
  const GlobalStyle = createGlobalStyle`
  .gfNXAQ{
    background-color:${themeBuilder?.table?.backgroundColor}!important;
  }
  `;
  return (
    <>
      <div className="cs-table">
        <div className="d-flex align-items-center">
          <h2
            className="col-6  kabc fs-6 fw-bold mt-5 "
            style={{ color: themeBuilder?.color?.headingTextColor }}
          >
            {props?.data?.title}
          </h2>
        </div>
        <TableView
          // header={Recent_Application_Header}
          data={tableData}
          apiHeader={tableHeader}
        />
      </div>
      <GlobalStyle />
    </>
  );
};
export default RecentApplication;
