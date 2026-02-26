import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationDetailsByType } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import TableView from "../TableView/TableView";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import MaskedValue from "../MaskedValue";

const ManagerList = () => {
  const [managerData, setManagerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const applicationNo = id;

  // Fetch manager list when component mounts
  useEffect(() => {
    if (applicationNo) {
      fetchManagerList();
    }
  }, [applicationNo]);

  const fetchManagerList = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetailsByType(applicationNo, 'manager_list');
      setManagerData(response.data);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error fetching manager list:", error);
      toast.error("Failed to fetch manager list");
    } finally {
      setLoading(false);
    }
  };

  const Activity_Loans_Header = [
    {
      name: "التسلسل",
      selector: (row: { serial: any }) => row.serial,
      sortable: true,
      width: "100px",
    },
    {
      name: "الاسم",
      selector: (row: { name: any }) => row.name,
      sortable: true,
    },
    {
      name: "المنصب",
      selector: (row: { position: any }) => row.position,
      sortable: true,
    },
    {
      name: "الهوية الوطنية/الإقامة",
      cell: (row: any) => (
        <MaskedValue value={row.nationalId} showToggle={false} unmaskedCount={4} />
      ),
      width: "200px",
      sortable: true,
    },
    {
      name: "تاريخ الميلاد",
      selector: (row: { birthDate: any }) => row.birthDate,
      sortable: true,
    },
    {
      name: "الجنسية",
      selector: (row: { nationality: any }) => row.nationality,
      sortable: true,
    },
  ];
  // Map API data to table format
  const Activity_Loans_Data = managerData?.data?.map((manager: any, index: number) => ({
    serial: index + 1,
    name: manager?.name || "-",
    position: manager?.relation?.name || "-",
    nationalId: manager?.identity?.id || "-",
    birthDate: manager?.birthDate || "-",
    nationality: manager?.nationality?.name || "-",
  })) || [];


  // Export to PDF


  return (
    <>
      
      <div className="service mt-4">
        <TableView
          header={Activity_Loans_Header}
          data={Activity_Loans_Data}
          isLoading={loading}
        />
      </div>
    </>
  );
};

export default ManagerList;
