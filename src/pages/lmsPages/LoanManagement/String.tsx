
// import { useDropzone } from "react-dropzone";

const data = [
  {
    FileName: "Doc1",
    DocumentType: "IncomeVerification",
    DocumentSubType: "Credit",
    AccountNo: "12345",
    Attach: "LegalDoc",
    Status: "Active",
    TrackingNo: "345678",
    DocketNo: "345678",
    Location: "Loan application",
    ReceivedData: "11/07/24",
  },
  {
    FileName: "Doc1",
    DocumentType: "IncomeVerification",
    DocumentSubType: "Credit",
    AccountNo: "12345",
    Attach: "LegalDoc",
    Status: "Inactive",
    TrackingNo: "345678",
    DocketNo: "345678",
    Location: "Loan application",
    ReceivedData: "11/07/24",
  },
];

const StringTest = () => {
  const s: any = ["a", "c", "a", "d", "e"];
  //   const filterArray = s.sort((a, b) => a.localeCompare(b));
  const arrayFilter = s.filter((num, index) => {
    if (num == num[index]) {
      return null;
    }

    return num;
  });
  //   const checkIndex = arrayFilter?.findIndex((num) => num);
  return <div></div>;
};

export default StringTest;
