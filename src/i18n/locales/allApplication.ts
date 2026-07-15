import type { ModuleLocale } from "../types";

/**
 * Application View / AllApplication module.
 * Covers ViewApplication and its tab/section subcomponents.
 * Flat dotted keys (keySeparator:false), grouped by page/tab.
 */
const allApplication: ModuleLocale = {
  namespace: "allApplication",
  en: {
    // View Application shell + tabs
    "view.title": "View Application",
    "tabs.personalInformation": "Personal Information",
    "tabs.loanApplication": "Loan Application",
    "tabs.salaryDetails": "Salary Details",
    "tabs.documents": "Documents",
    "tabs.simahCheck": "Simah Check",
    "tabs.openBankingCheck": "Open Banking Check",
    "tabs.complianceCheck": "Compliance Check",
    "tabs.creditCheck": "Credit Check",
    "tabs.approval": "Approval",

    // Loan Information
    "loanInfo.amountTitle": "Loan Amount Info",
    "loanInfo.applicationTitle": "Loan Application Info",

    // Salary Details
    "salary.title": "Salary Details",
    "salary.fullName": "Full Name",
    "salary.housingAllowance": "Housing Allowance",
    "salary.employerName": "Employer Name",
    "salary.employmentStatus": "Employment Status",
    "salary.basicWage": "Basic Wage",
    "salary.otherAllowance": "Other Allowance",
    "salary.workingMonths": "Working Months",
    "salary.rejectedMessage": "This Application has been rejected",
    "salary.reason": "Reason: {{value}}",

    // Disclaimer
    "disclaimer.agree": "I agreed and accepted the following disclaimer:",
    "disclaimer.selectedOption": "Selected option: {{value}}",

    // Open Banking Check tabs
    "openBanking.tab.bankStatement": "Bank Statement",
    "openBanking.tab.requestFinancialDocument": "Request Financial Document",
    "openBanking.tab.approveBankingStatement": "Approve Banking Statement",

    // Bank Statement
    "bankStatement.accountHolderName": "Account Holder Name",
    "bankStatement.bankName": "Bank Name",
    "bankStatement.accountNumber": "Account Number",
    "bankStatement.transactionId": "Transaction ID: {{value}}",
    "bankStatement.accountId": "Account ID",
    "bankStatement.providerId": "Provider ID",
    "bankStatement.indicator": "Credit/Debit Indicator",
    "bankStatement.bookingDateTime": "Booking Date Time",

    // Simah Check tabs
    "simah.tab.consumerInquiry": "Consumer Inquiry",
    "simah.tab.uploadConsumerDocument": "Upload Simah Consumer Document",

    // Document gallery
    "documents.upload": "Upload Document",

    // Compliance Check
    "compliance.title": "Compliance Questions",

    // Credit Check tabs
    "creditCheck.tab.weightagesInfo": "Credit Weightages Info as",
    "creditCheck.tab.approveCreditInfo": "Approve Credit Info",
    "creditCheck.tab.currentWeightages": "Current Application Weightages is: {{value}}",

    // Credit Info fields
    "creditInfo.customerType": "Customer type",
    "creditInfo.employmentTenure": "Employment tenure",
    "creditInfo.currentEmploymentTenure": "Current employment tenure",
    "creditInfo.ageOfCustomer": "Age of customer",
    "creditInfo.region": "Region",
    "creditInfo.simahCreditScore": "Simah credit score",
    "creditInfo.activeCreditProducts": "Number of active credit products",
    "creditInfo.creditConsumption": "Credit consumption",
    "creditInfo.averageMonthlyBalance": "Average monthly balance",
    "creditInfo.salary": "Salary",

    // Approval table columns
    "approval.column.checks": "Checks",
    "approval.column.processedDate": "Processed Date",
    "approval.column.processedBy": "Processed By",
    "approval.column.comment": "Comment",

    // Loan Approval labels
    "loanApproval.requestedAmount": "Requested Loan Amount:",
    "loanApproval.processingFee": "Processing Fee:",
    "loanApproval.profit": "Profit (0 %):",
    "loanApproval.totalRepayment": "Total Repayment Amount:",
    "loanApproval.totalPayable": "Total Payable Amount to Customer :",

    // Application Document tabs
    "appDoc.tab.requestDocuments": "Request Documents",
    "appDoc.tab.viewDocuments": "View Documents",

    // Activity Log
    "activity.title": "Activity Log",
    "activity.applicationNumber": "Application# {{value}}",

    // Document request / view
    "docRequest.selectPrompt": "Please select documents required for this application:",
    "docRequest.viewAllDocuments": "View All Documents",
    "docRequest.commodityContract": "Commodity Contract",
    "docRequest.usPassport": "US Passport",
    "docRequest.requestNow": "Request Now",
    "docView.prompt": "Documents against this application:",
  },
  fr: {
    "view.title": "Consulter la demande",
    "tabs.personalInformation": "Informations personnelles",
    "tabs.loanApplication": "Demande de financement",
    "tabs.salaryDetails": "Détails du salaire",
    "tabs.documents": "Documents",
    "tabs.simahCheck": "Vérification Simah",
    "tabs.openBankingCheck": "Vérification Open Banking",
    "tabs.complianceCheck": "Vérification de conformité",
    "tabs.creditCheck": "Vérification de crédit",
    "tabs.approval": "Approbation",

    "loanInfo.amountTitle": "Informations sur le montant du financement",
    "loanInfo.applicationTitle": "Informations sur la demande de financement",

    "salary.title": "Détails du salaire",
    "salary.fullName": "Nom complet",
    "salary.housingAllowance": "Indemnité de logement",
    "salary.employerName": "Nom de l'employeur",
    "salary.employmentStatus": "Statut d'emploi",
    "salary.basicWage": "Salaire de base",
    "salary.otherAllowance": "Autre indemnité",
    "salary.workingMonths": "Mois travaillés",
    "salary.rejectedMessage": "Cette demande a été rejetée",
    "salary.reason": "Motif : {{value}}",

    "disclaimer.agree": "J'ai lu et accepté la clause de non-responsabilité suivante :",
    "disclaimer.selectedOption": "Option sélectionnée : {{value}}",

    "openBanking.tab.bankStatement": "Relevé bancaire",
    "openBanking.tab.requestFinancialDocument": "Demander un document financier",
    "openBanking.tab.approveBankingStatement": "Approuver le relevé bancaire",

    "bankStatement.accountHolderName": "Nom du titulaire du compte",
    "bankStatement.bankName": "Nom de la banque",
    "bankStatement.accountNumber": "Numéro de compte",
    "bankStatement.transactionId": "Identifiant de transaction : {{value}}",
    "bankStatement.accountId": "Identifiant du compte",
    "bankStatement.providerId": "Identifiant du fournisseur",
    "bankStatement.indicator": "Indicateur crédit/débit",
    "bankStatement.bookingDateTime": "Date et heure de comptabilisation",

    "simah.tab.consumerInquiry": "Consultation du consommateur",
    "simah.tab.uploadConsumerDocument": "Téléverser le document consommateur Simah",

    "documents.upload": "Téléverser un document",

    "compliance.title": "Questions de conformité",

    "creditCheck.tab.weightagesInfo": "Informations sur les pondérations de crédit",
    "creditCheck.tab.approveCreditInfo": "Approuver les informations de crédit",
    "creditCheck.tab.currentWeightages": "La pondération actuelle de la demande est : {{value}}",

    "creditInfo.customerType": "Type de client",
    "creditInfo.employmentTenure": "Ancienneté professionnelle",
    "creditInfo.currentEmploymentTenure": "Ancienneté dans l'emploi actuel",
    "creditInfo.ageOfCustomer": "Âge du client",
    "creditInfo.region": "Région",
    "creditInfo.simahCreditScore": "Score de crédit Simah",
    "creditInfo.activeCreditProducts": "Nombre de produits de crédit actifs",
    "creditInfo.creditConsumption": "Consommation de crédit",
    "creditInfo.averageMonthlyBalance": "Solde mensuel moyen",
    "creditInfo.salary": "Salaire",

    "approval.column.checks": "Vérifications",
    "approval.column.processedDate": "Date de traitement",
    "approval.column.processedBy": "Traité par",
    "approval.column.comment": "Commentaire",

    "loanApproval.requestedAmount": "Montant de financement demandé :",
    "loanApproval.processingFee": "Frais de traitement :",
    "loanApproval.profit": "Bénéfice (0 %) :",
    "loanApproval.totalRepayment": "Montant total de remboursement :",
    "loanApproval.totalPayable": "Montant total à verser au client :",

    "appDoc.tab.requestDocuments": "Demander des documents",
    "appDoc.tab.viewDocuments": "Consulter les documents",

    "activity.title": "Journal d'activité",
    "activity.applicationNumber": "Demande n° {{value}}",

    "docRequest.selectPrompt": "Veuillez sélectionner les documents requis pour cette demande :",
    "docRequest.viewAllDocuments": "Voir tous les documents",
    "docRequest.commodityContract": "Contrat de marchandise",
    "docRequest.usPassport": "Passeport américain",
    "docRequest.requestNow": "Demander maintenant",
    "docView.prompt": "Documents liés à cette demande :",
  },
  ar: {
    "view.title": "عرض الطلب",
    "tabs.personalInformation": "المعلومات الشخصية",
    "tabs.loanApplication": "طلب التمويل",
    "tabs.salaryDetails": "تفاصيل الراتب",
    "tabs.documents": "المستندات",
    "tabs.simahCheck": "فحص سمة",
    "tabs.openBankingCheck": "فحص المصرفية المفتوحة",
    "tabs.complianceCheck": "فحص الامتثال",
    "tabs.creditCheck": "فحص الائتمان",
    "tabs.approval": "الموافقة",

    "loanInfo.amountTitle": "معلومات مبلغ التمويل",
    "loanInfo.applicationTitle": "معلومات طلب التمويل",

    "salary.title": "تفاصيل الراتب",
    "salary.fullName": "الاسم الكامل",
    "salary.housingAllowance": "بدل السكن",
    "salary.employerName": "اسم صاحب العمل",
    "salary.employmentStatus": "حالة التوظيف",
    "salary.basicWage": "الأجر الأساسي",
    "salary.otherAllowance": "بدلات أخرى",
    "salary.workingMonths": "أشهر العمل",
    "salary.rejectedMessage": "تم رفض هذا الطلب",
    "salary.reason": "السبب: {{value}}",

    "disclaimer.agree": "لقد وافقت وقبلت إخلاء المسؤولية التالي:",
    "disclaimer.selectedOption": "الخيار المحدد: {{value}}",

    "openBanking.tab.bankStatement": "كشف الحساب البنكي",
    "openBanking.tab.requestFinancialDocument": "طلب مستند مالي",
    "openBanking.tab.approveBankingStatement": "الموافقة على كشف الحساب البنكي",

    "bankStatement.accountHolderName": "اسم صاحب الحساب",
    "bankStatement.bankName": "اسم البنك",
    "bankStatement.accountNumber": "رقم الحساب",
    "bankStatement.transactionId": "معرّف المعاملة: {{value}}",
    "bankStatement.accountId": "معرّف الحساب",
    "bankStatement.providerId": "معرّف المزوّد",
    "bankStatement.indicator": "مؤشر الدائن/المدين",
    "bankStatement.bookingDateTime": "تاريخ ووقت القيد",

    "simah.tab.consumerInquiry": "استعلام المستهلك",
    "simah.tab.uploadConsumerDocument": "رفع مستند مستهلك سمة",

    "documents.upload": "رفع مستند",

    "compliance.title": "أسئلة الامتثال",

    "creditCheck.tab.weightagesInfo": "معلومات أوزان الائتمان",
    "creditCheck.tab.approveCreditInfo": "الموافقة على معلومات الائتمان",
    "creditCheck.tab.currentWeightages": "الوزن الحالي للطلب هو: {{value}}",

    "creditInfo.customerType": "نوع العميل",
    "creditInfo.employmentTenure": "مدة التوظيف",
    "creditInfo.currentEmploymentTenure": "مدة التوظيف الحالية",
    "creditInfo.ageOfCustomer": "عمر العميل",
    "creditInfo.region": "المنطقة",
    "creditInfo.simahCreditScore": "درجة ائتمان سمة",
    "creditInfo.activeCreditProducts": "عدد المنتجات الائتمانية النشطة",
    "creditInfo.creditConsumption": "استهلاك الائتمان",
    "creditInfo.averageMonthlyBalance": "متوسط الرصيد الشهري",
    "creditInfo.salary": "الراتب",

    "approval.column.checks": "الفحوصات",
    "approval.column.processedDate": "تاريخ المعالجة",
    "approval.column.processedBy": "تمت المعالجة بواسطة",
    "approval.column.comment": "تعليق",

    "loanApproval.requestedAmount": "مبلغ التمويل المطلوب:",
    "loanApproval.processingFee": "رسوم المعالجة:",
    "loanApproval.profit": "الربح (0 %):",
    "loanApproval.totalRepayment": "إجمالي مبلغ السداد:",
    "loanApproval.totalPayable": "إجمالي المبلغ المستحق للعميل:",

    "appDoc.tab.requestDocuments": "طلب المستندات",
    "appDoc.tab.viewDocuments": "عرض المستندات",

    "activity.title": "سجل النشاط",
    "activity.applicationNumber": "الطلب رقم {{value}}",

    "docRequest.selectPrompt": "يرجى تحديد المستندات المطلوبة لهذا الطلب:",
    "docRequest.viewAllDocuments": "عرض جميع المستندات",
    "docRequest.commodityContract": "عقد السلع",
    "docRequest.usPassport": "جواز سفر أمريكي",
    "docRequest.requestNow": "اطلب الآن",
    "docView.prompt": "المستندات المرتبطة بهذا الطلب:",
  },
};

export default allApplication;
