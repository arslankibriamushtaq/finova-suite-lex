export const Customer_List_Header = [
  {
    name: "Date",
    selector: (row: { Customer: any }) => row.Customer,
  },
  {
    name: "Action",
    selector: (row: { ApplicationNo: any }) => row.ApplicationNo,
  },
  {
    name: "Result",
    selector: (row: { ProductName: any }) => row.ProductName,
  },
  {
    name: "Contact",
    selector: (row: { CrNumber: any }) => row.CrNumber,
  },
  {
    name: "Reason",
    selector: (row: { Email: any }) => row.Email,
  },
  {
    name: "Promise Date",
    selector: (row: { Phone: any }) => row.Phone,
  },
  {
    name: "Promise Amt",
    selector: (row: { Date: any }) => row.Date,
  },
  {
    name: "Current Amount Due",
    selector: (row: { ParentStatus: any }) => row.ParentStatus,
  },
  {
    name: "Condition",
    selector: (row: { Status: any }) => row.Status,
  },
  {
    name: "Appointment",
    selector: (row: { Action: any }) => row.Action,
  },
];

export const Source_Of_Revenue_Header = [
  {
    name: "Name",
    selector: (row: { Name: any }) => row.Name,
  },
  {
    name: "Change Status",
    selector: (row: { changeStatus: any }) => row.changeStatus,
  },
  {
    name: "Status",
    selector: (row: { Status: any }) => row.Status,
  },
  {
    name: "Action",
    selector: (row: { Action: any }) => row.Action,
  },
];
export const Purpose_Of_Revenue_Header = [
  {
    name: "Name",
    selector: (row: { Name: any }) => row.Name,
  },
  {
    name: "Status",
    selector: (row: { Status: any }) => row.Status,
  },
  {
    name: "Change Status",
    selector: (row: { changeStatus: any }) => row.changeStatus,
  },

  {
    name: "Action",
    selector: (row: { Action: any }) => row.Action,
  },
];
export const Check_Types_Header = [
  {
    name: "Name",
    selector: (row: { Name: any }) => row.Name,
  },
  {
    name: "Status",
    selector: (row: { Status: any }) => row.Status,
  },
  {
    name: "Action",
    selector: (row: { Action: any }) => row.Action,
  },
];
export const Types_Reasons_Header = [
  {
    name: "Name",
    selector: (row: { Name: any }) => row.Name,
  },
  {
    name: "Reason",
    selector: (row: { Reasons: any }) => row.Reasons,
  },
  {
    name: "Status",
    selector: (row: { Status: any }) => row.Status,
  },
  {
    name: "Action",
    selector: (row: { Action: any }) => row.Action,
  },
];
export const All_Application_Header = [
  {
    name: "Application No",
    selector: (row: { ApplicationNo: any }) => row.ApplicationNo,
  },
  {
    name: "Kastle Contract No",
    selector: (row: { KastleContractNo: any }) => row.KastleContractNo,
  },
  {
    name: "Kastle Application No",
    selector: (row: { KastleApplicationNo: any }) => row.KastleApplicationNo,
  },
  {
    name: "Kastle Status",
    selector: (row: { KastleStatus: any }) => row.KastleStatus,
  },
  {
    name: "Contract Status",
    selector: (row: { ContractStatus: any }) => row.ContractStatus,
  },
  {
    name: "Customer Name",
    selector: (row: { CustomerName: any }) => row.CustomerName,
  },
  {
    name: "CR No.",
    selector: (row: { CRNo: any }) => row.CRNo,
  },

  {
    name: "Product",
    selector: (row: { Product: any }) => row.Product,
  },
  {
    name: "Loan Tenure",
    selector: (row: { LoanTenure: any }) => row.LoanTenure,
  },
  {
    name: "Loan Amount",
    selector: (row: { LoanAmount: any }) => row.LoanAmount,
  },
  {
    name: "Application Date",
    selector: (row: { ApplicationDate: any }) => row.ApplicationDate,
  },
  {
    name: "Status",
    selector: (row: { Status: any }) => row.Status,
  },
  {
    name: "Reason",
    selector: (row: { Reason: any }) => row.Reason,
  },
  {
    name: "Action",
    selector: (row: { Action: any }) => row.Action,
  },
];

export const Rejected_Loans_Header = [
  {
    name: "Application No",
    selector: (row: { ApplicationNo: any }) => row.ApplicationNo,
  },
  {
    name: "Kastle Contract No",
    selector: (row: { KastleContractNo: any }) => row.KastleContractNo,
  },
  {
    name: "Kastle Application No",
    selector: (row: { KastleApplicationNo: any }) => row.KastleApplicationNo,
  },
  {
    name: "Kastle Status",
    selector: (row: { KastleStatus: any }) => row.KastleStatus,
  },
  {
    name: "Contract Status",
    selector: (row: { ContractStatus: any }) => row.ContractStatus,
  },
  {
    name: "Customer Name",
    selector: (row: { CustomerName: any }) => row.CustomerName,
  },
  {
    name: "CR No.",
    selector: (row: { CRNo: any }) => row.CRNo,
  },

  {
    name: "Product",
    selector: (row: { Product: any }) => row.Product,
  },
  {
    name: "Loan Tenure",
    selector: (row: { LoanTenure: any }) => row.LoanTenure,
  },
  {
    name: "Loan Amount",
    selector: (row: { LoanAmount: any }) => row.LoanAmount,
  },
  {
    name: "Application Date",
    selector: (row: { ApplicationDate: any }) => row.ApplicationDate,
  },
  {
    name: "Status",
    selector: (row: { Status: any }) => row.Status,
  },
  {
    name: "Reason",
    selector: (row: { Reason: any }) => row.Reason,
  },
  {
    name: "Action",
    selector: (row: { Action: any }) => row.Action,
  },
];
export const InComplete_Loans_Header = [
  {
    name: "Application No",
    selector: (row: { ApplicationNo: any }) => row.ApplicationNo,
  },
  {
    name: "CR No.",
    selector: (row: { CRNo: any }) => row.CRNo,
  },

  {
    name: "Product",
    selector: (row: { Product: any }) => row.Product,
  },
  {
    name: "Loan Tenure",
    selector: (row: { LoanTenure: any }) => row.LoanTenure,
  },
  {
    name: "Application Date",
    selector: (row: { ApplicationDate: any }) => row.ApplicationDate,
  },
  {
    name: "Status",
    selector: (row: { Status: any }) => row.Status,
  },
  {
    name: "Customer Mobile",
    selector: (row: { CustomerMobile: any }) => row.CustomerMobile,
  },
  {
    name: "Reason from Partner",
    selector: (row: { ReasonFromPartner: any }) => row.ReasonFromPartner,
  },
  {
    name: "Reason",
    selector: (row: { Reason: any }) => row.Reason,
  },
  {
    name: "Action",
    selector: (row: { Action: any }) => row.Action,
  },
];
export const Cancelled_Header = [
  {
    name: "Application No",
    selector: (row: { ApplicationNo: any }) => row.ApplicationNo,
  },
  {
    name: "Kastle Contract No",
    selector: (row: { KastleContractNo: any }) => row.KastleContractNo,
  },
  {
    name: "Kastle Application No",
    selector: (row: { KastleApplicationNo: any }) => row.KastleApplicationNo,
  },
  {
    name: "Kastle Status",
    selector: (row: { KastleStatus: any }) => row.KastleStatus,
  },
  {
    name: "Contract Status",
    selector: (row: { ContractStatus: any }) => row.ContractStatus,
  },
  {
    name: "Customer Name",
    selector: (row: { CustomerName: any }) => row.CustomerName,
  },
  {
    name: "CR No.",
    selector: (row: { CRNo: any }) => row.CRNo,
  },

  {
    name: "Product",
    selector: (row: { Product: any }) => row.Product,
  },
  {
    name: "Loan Tenure",
    selector: (row: { LoanTenure: any }) => row.LoanTenure,
  },
  {
    name: "Loan Amount",
    selector: (row: { LoanAmount: any }) => row.LoanAmount,
  },
  {
    name: "Application Date",
    selector: (row: { ApplicationDate: any }) => row.ApplicationDate,
  },
  {
    name: "Status",
    selector: (row: { Status: any }) => row.Status,
  },
  {
    name: "Reason",
    selector: (row: { Reason: any }) => row.Reason,
  },
  {
    name: "Action",
    selector: (row: { Action: any }) => row.Action,
  },
];
export const Activity_Loans_Header = [
  {
    name: "ID",
    selector: (row: { Id: any }) => row.Id,
  },
  {
    name: "Application No.",
    selector: (row: { ApplicationNo: any }) => row.ApplicationNo,
  },

  {
    name: "Time",
    selector: (row: { Time: any }) => row.Time,
  },
  {
    name: "Date",
    selector: (row: { Date: any }) => row.Date,
  },
  {
    name: "Updated By",
    selector: (row: { UpdatedBy: any }) => row.UpdatedBy,
  },
  {
    name: "Event",
    selector: (row: { Event: any }) => row.Event,
  },
  {
    name: "Changes",
    selector: (row: { Changes: any }) => row.Changes,
  },
];
export const Recent_Application_Header = [
  {
    name: "Application No",
    selector: (row: { ApplicationNo: any }) => row.ApplicationNo,
  },
  {
    name: "Customer Name.",
    selector: (row: { cusotmerName: any }) => row.cusotmerName,
  },

  {
    name: "Phone",
    selector: (row: { phoneNo: any }) => row.phoneNo,
  },
  {
    name: "Date",
    selector: (row: { date: any }) => row.date,
  },
  {
    name: "Amount",
    selector: (row: { amount: any }) => row.amount,
  },
  {
    name: "Parent Status",
    selector: (row: { parentStatus: any }) => row.parentStatus,
  },
  {
    name: "Status",
    selector: (row: { status: any }) => row.status,
  },
  {
    name: "Action",
    selector: (row: { Action: any }) => row.Action,
  },
];

export const Customer_Individual_Header = [
  {
    name: "Customer ID",
    selector: (row: { CustomerID: any }) => row.CustomerID,
  },
  {
    name: "Name",
    selector: (row: { Name: any }) => row.Name,
  },
  {
    name: "Type",
    selector: (row: { Type: any }) => row.Type,
  },
  {
    name: "Phone No.",
    selector: (row: { PhoneNo: any }) => row.PhoneNo,
  },
  {
    name: "Email",
    selector: (row: { Email: any }) => row.Email,
  },
  {
    name: "Status",
    selector: (row: { Status: any }) => row.Status,
  },
];

export const Account_Documents_List_Header = [
  {
    name: "File Name",
    selector: (row: { FileName: any }) => row.FileName,
  },
  {
    name: "Document Type",
    selector: (row: { DocumentType: any }) => row.DocumentType,
  },
  {
    name: "Document Sub-Type",
    selector: (row: { DocumentSubType: any }) => row.DocumentSubType,
  },
];

export const Get_All_Comments_Header = [
  {
    name: "Alert",
    selector: (row: { isAlert: any }) => row.isAlert,
  },
  {
    name: "Type",
    selector: (row: { type: any }) => row.type,
  },
  {
    name: "Sub-Type",
    selector: (row: { subType: any }) => row.subType,
  },
  {
    name: "Comments",
    selector: (row: { comments: any }) => row.comments,
  },
  {
    name: "Comment By",
    selector: (row: { commentedBy: any }) => row.commentedBy,
  },
  {
    name: "Comment Date",
    selector: (row: { timestamp: any }) => row.timestamp,
  },
  {
    name: "Action",
    selector: (row: { Action: any }) => row.Action,
  },
];

export const Get_All_Promises_Header = [
  {
    name: "Promised Amount",
    selector: (row: { promisedAmount: any }) => row.promisedAmount,
  },
  {
    name: "promisedDate",
    selector: (row: { promisedDate: any }) => row.promisedDate,
  },
  {
    name: "TakenBy",
    selector: (row: { takenBy: any }) => row.takenBy,
  },
  {
    name: "TakenDate",
    selector: (row: { takenDate: any }) => row.takenDate,
  },
  {
    name: "DueOnTakenDate",
    selector: (row: { dueOnTakenDate: any }) => row.dueOnTakenDate,
  },
  {
    name: "CollectedAmount",
    selector: (row: { collectedAmount: any }) => row.collectedAmount,
  },
  {
    name: "BrokenPromise",
    selector: (row: { isBrokenPromise: any }) => row.isBrokenPromise,
  },
  {
    name: "CancelledPromise",
    selector: (row: { isCancelledPromise: any }) => row.isCancelledPromise,
  },
];
