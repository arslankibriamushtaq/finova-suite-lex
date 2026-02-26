import { Button, Input, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { CopyOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import { getAllApis, getPartnerAllApis } from "../../redux/apis/apisCrud";
function EnabledApis({ apisData, partnerData }: any) {
  const [copied, setCopied] = useState(false);
  // const [partnerData, setPartnerData] = useState<any>(null);
  // const [apisData, setApisData] = useState<any>([]);

  const handleCopy = () => {
    navigator.clipboard.writeText(partnerData?.secret_key || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // reset after 1.5s
    });
  };

  // useEffect(() => {
  //   const fetchAllApis = async () => {
  //     try {
  //       const response = await getPartnerAllApis();
  //       if(response?.data?.success){
  //         setPartnerData(response?.data?.data?.partner);
  //         setApisData(response?.data?.data?.apis?.data || []);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching all APIs:", error);
  //     }
  //   };

  //   fetchAllApis();
  // }, []);
  const Activity_Loans_Header = [
    {
      name: "Name",
      selector: (row: any) => row.name,
    },
    {
      name: "Base Url",
      selector: (row: any) => row.base_url,
    },
    {
      name: "Endpoint",
      selector: (row: any) => row.path,
    },
    {
      name: "Method",
      selector: (row: any) => row.method,
    },
  ];
  const mappedData =
    apisData &&
    apisData?.map((item: any) => {
      return {
        id: item?.id,
        name: item?.name || "-",
        base_url: item?.base_url || "-",
        path: item?.path || "-",
        method: item?.method || "-",
      };
    });
  return (
    <div className="p-3  my-box">
      <div className="col-4 d-flex gap-2">
        <span>
          Secret <br /> key
        </span>
        <Input
          style={{ background: "#e9ecef" }}
          readOnly
          value={partnerData?.secret_key || ""}
        />
        <Tooltip title={copied ? "Copied!" : "Copy"}>
          <Button
            icon={<CopyOutlined />}
            onClick={handleCopy}
            type={copied ? "primary" : "default"}
          />
        </Tooltip>
      </div>
      <div className="mt-3 my-box">
        <TableView
          header={Activity_Loans_Header}
          data={mappedData}
paginationShow={false}
         
        />
      </div>{" "}
    </div>
  );
}

export default EnabledApis;
