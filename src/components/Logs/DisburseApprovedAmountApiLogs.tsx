import { useEffect, useState } from "react";

import {
  getDisburseApprovedAmountApiLogs,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";

import { ApiLogAccordion } from "./ApiLogAccordian";
import Loader from "../Loader/Loader";
const DisburseApprovedAmountApiLogs = () => {
  const [totalRows, setTotalRows] = useState(0);
 
  const [responseData,setresponseData]=useState<any>([]);
  const [loading, setLoading] = useState(false);
const [refresh, SetRefresh]= useState(true)

  useEffect(() => {
    getData();
  }, [refresh]);
const getData = async () => {
  try {
    setLoading(true);
    const response = await getDisburseApprovedAmountApiLogs();

    if (response.data?.success) {
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
            <div className="d-flex align-items-center col-6 justify-content-between my-3" style={{fontSize: '15px', fontWeight: 'bold'}}>Disburse Amount Api Logs</div>
          </div>
        </div>

      </div>

      <div className="cs-table p-2">
              <ApiLogAccordion logs={responseData} SetRefresh={SetRefresh} logsByDate={false}/>

      
        {responseData?.length == 0 && !loading && (
          <div className="d-flex justify-content-center mt-5 bg-red">
            No data found
          </div>
        )}
      </div>
    </>
  );
};

export default DisburseApprovedAmountApiLogs;
