import { useEffect, useState } from "react";

import TableView from "../TableView/TableView";

import { leadsList } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import MaskedValue from "../MaskedValue";

const PartnerMnagerList = ({ setSelectedTab }: any) => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const Activity_Loans_Header = [
    {
      name: "الجنسية",
      selector: (row: { name: any }) => row.name,
      sortable: true,
    },
    {
      name: "تاريخ الميلاد",
      selector: (row: { birthDate: any }) => row.birthDate,
      sortable: true,
    },
    {
      name: "المنصب",
      selector: (row: { jobTitle: any }) => row.jobTitle,
      sortable: true,
    },
    {
      name: "الهوية الوطنية/الاقامة",
      cell: (row: any) => (
        <MaskedValue value={row.cnic} showToggle={false} unmaskedCount={4} />
      ),
      width: "200px",
      sortable: true,
    },
    {
      name: "الاسم",
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
    },
    {
      name: "التسلسل",
      selector: (row: { orderDate: any }) => row.orderDate,
      sortable: true,
    },
  ];

  const Activity_Loans_Data = [
    {
      Sr: 1,
      name: "علي محمد",
      birthDate: "May 10, 1989",
      jobTitle: "عضو مجلس إدارة",
      cnic: "35201-1234567-8",
      phone: "1049966607",
      orderDate: "2024-06-01",
      membershipNumber: "1",
    },
    {
      Sr: 2,
      name: "حسن علي",
      birthDate: "April 22, 1985",
      jobTitle: "مدير العمليات",
      cnic: "42101-9876543-1",
      phone: "1049966611",
      orderDate: "2024-05-20",
      membershipNumber: "2",
    },
    {
      Sr: 3,
      name: "محمد حسين",
      birthDate: "January 15, 1990",
      jobTitle: "محاسب",
      cnic: "61101-1111111-9",
      phone: "1049966622",
      orderDate: "2024-04-15",
      membershipNumber: "3",
    },
  ];

  const getLeadsList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await leadsList(page, pageSize);
      if (response) {
        const data = response?.data?.data?.data;
        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(response?.data?.data?.total || 0);
        setFrom(response?.data?.data?.from || 0);
        setTo(response?.data?.data?.to || 0);
        setPage(response?.data?.data?.current_page);
        setTotalPage(response?.data?.data?.last_page);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getLeadsList();
  }, [page, pageSize]);
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      return {
        id: item.id,
        Sr: index + from,
        phone: item?.phone,
        cnic: item?.cnic || "-",
        accountBalance: item?.balance,
        UpdatedBy: item?.updated_at,
        accountType: item?.user_type || "-",
        accountStatus: item?.accountStatus,
        status: item?.status,
      };
    });

  return (
    <>
      <div className="service">
        <TableView
          header={Activity_Loans_Header}
          data={Activity_Loans_Data}
          totalRows={totalRows}
          isLoading={skelitonLoading}
          from={from}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={to}
        />
      </div>
    </>
  );
};

export default PartnerMnagerList;
