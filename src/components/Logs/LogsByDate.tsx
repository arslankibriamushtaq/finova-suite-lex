import { useEffect, useState } from "react";

import {
  getLogsBydate,
  getApiLogsBydate
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";

import { ApiLogAccordion } from "./ApiLogAccordian";
import { useParams } from "react-router-dom";
import Loader from "../Loader/Loader";
const LogsByDate = () => {
 const { customerId,type } = useParams();
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
 
  const [responseData,setresponseData]=useState<any>([]);
  const [loading, setLoading] = useState(false);
const [refresh, SetRefresh]= useState(true)

  useEffect(() => {
    getData(customerId);
  }, [refresh]);
const getData = async (date: any) => {
  try {
    setLoading(true);
    let response;
    if(type === "logs"){
       response = await getLogsBydate(date);
    }else if(type === "apiLogs"){
      response = await getApiLogsBydate(date);
    }
    if (response?.data?.success) {
      const data = response.data.data;
      setresponseData(data || []);
      setTotalRows(response.data?.pageInfo?.totalItems || 0);
    } else {
      setresponseData([]);
      setTotalRows(0);
    }
  } catch (error: any) {
    toast.error(error?.message);
    setresponseData([]);
    setTotalRows(0);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
    {loading && <Loader />}
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <div className="col-10">
            {/* <h3 className="mb-0">Disburse Amount Api Logs</h3> */}
            <div className="d-flex align-items-center col-6 justify-content-between my-3" style={{fontSize: '15px', fontWeight: 'bold'}}>{type === "logs" ? "Logs" : "Api Logs"}</div>
          </div>
        </div>

      </div>

      <div className="cs-table p-2">
              <ApiLogAccordion logs={responseData} SetRefresh={SetRefresh} logsByDate={true} />

      
        {responseData?.length == 0 && !loading && (
          <div className="d-flex justify-content-center mt-5 bg-red">
            No data found
          </div>
        )}
      </div>
    </>
  );
};

export default LogsByDate;
