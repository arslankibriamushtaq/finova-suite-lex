import { Container, Row, Col, Form } from "react-bootstrap";
const PersonalInformation = () => {

  const data = {
    exp: "1730893437",
    lat: "1730893437",
    jti: "52e16851-f781-47f0-9242-4ef6916efbfa",
    nbf: "1730893437",
    sub: "2555752555",
    gender: "M",
    status: "COMPLETED",
    transId: "38936611-1755-455d-8497-509462eb85f1",
    personId: "2555752555",
    serviceName: "OpenAccount",
    iqamaNumber: "2555752555",
    dateOfBirthG: "14-04-1987",
    dateOfBirthH: "16-08-1407",
    englishLastName: "NAZIR",
    iqamaIssueDateG: "02-10-2023",
    iqamaIssueDateH: "17-03-1445",
    nationalityCode: "304",
    nationalityDesc: "باكستان",
    englishFirstName: "ZAIN",
    englishThirdName: "FAROOQ",
    iqamaExpiryDateG: "10-12-2025",
    iqamaExpiryDateH: "09-06-1446",
    englishSecondName: "FAROOQ",
    iqamaVersionNumber: "1",
    iqamaIssuePlaceCode: "1014",
    iqamaIssuePlaceDesc: "شركة العلم لأمن المعلومات",
  };

  return (
   
    <div className="my-4 p-0">
      <Row>
        <Col md={6}>
          <h5 className="my-3 fs-6 fw-600">English</h5>
          {Object.entries({
            Exp: data.exp,
            lat: data.lat,
            Jti: data.jti,
            Nbf: data.nbf,
            Sub: data.sub,
            Gender: data.gender,
            Status: data.status,
            transId: data.transId,
            PersonId: data.personId,
            ServiceName: data.serviceName,
            IqamaNumber: data.iqamaNumber,
            "Date Of Birth(G)": data.dateOfBirthG,
            "Date Of Birth(H)": data.dateOfBirthH,
            EnglishLastName: data.englishLastName,
            iqamaIssueDateG: data.iqamaIssueDateG,
            iqamaIssueDateH: data.iqamaIssueDateH,
            NationalityCode: data.nationalityCode,
            NationalityDesc: data.nationalityDesc,
            EnglishFirstName: data.englishFirstName,
            EnglishThirdName: data.englishThirdName,
            iqamaExpiryDateG: data.iqamaExpiryDateG,
            iqamaExpiryDateH: data.iqamaExpiryDateH,
            EnglishSecondName: data.englishSecondName,
            IqamaVersionNumber: data.iqamaVersionNumber,
            IqamaIssuePlaceCode: data.iqamaIssuePlaceCode,
            IqamaIssuePlaceDesc: data.iqamaIssuePlaceDesc,
          }).map(([label, value], idx) => (
            <Form.Group className="mb-3" key={idx}>
              <Form.Label className="fs-12">{label}</Form.Label>
              <Form.Control className="fs-14 rounded-2" type="text" value={value} readOnly />
            </Form.Group>
          ))}
        </Col>

        <Col md={6} className="text-end">
          <h5 className="my-3 fs-6 fw-600">العربية</h5>
          {Object.entries({
            Exp: data.exp,
            lat: data.lat,
            Jti: data.jti,
            Nbf: data.nbf,
            Sub: data.sub,
            "نوع الجنس": data.gender,
            "حالة المعاملة": data.status,
            "رقم المعاملة": data.transId,
            "معرف الشخص": data.personId,
            "الخدمة": data.serviceName,
            "اسم الأول": data.englishFirstName,
            "اسم الثالث": data.englishThirdName,
            "تاريخ الميلاد (ميلادي)": data.dateOfBirthG,
            "تاريخ الميلاد (هجري)": data.dateOfBirthH,
            "اللقب": data.englishThirdName,
            "اسم الخدمة": data.serviceName,
            "رقم إقامة": data.iqamaNumber,
            "تاريخ إصدار الإقامة (ميلادي)": data.iqamaIssueDateG,
            "تاريخ إصدار الإقامة (هجري)": data.iqamaIssueDateH,
            "كود الجنسية": data.nationalityCode,
            "الجنسية دس": data.nationalityDesc,
            "تاريخ انتهاء الإقامة (ميلادي)": data.iqamaExpiryDateG,
            "تاريخ انتهاء الإقامة (هجري)": data.iqamaExpiryDateH,
            "رقم إصدار الإقامة": data.iqamaVersionNumber,
            "الإقامة إصدار رمز المكان": data.iqamaIssuePlaceCode,
            "وصف مكان إصدار الإقامة": data.iqamaIssuePlaceDesc,
          }).map(([label, value], idx) => (
            <Form.Group className="mb-3" key={idx}>
              <Form.Label className="fs-12">{label}</Form.Label>
              <Form.Control className="fs-14 text-end rounded-2" type="text" value={value} readOnly/>
            </Form.Group>
          ))}
        </Col>
      </Row>
    </div>
  );
};
export default PersonalInformation;
