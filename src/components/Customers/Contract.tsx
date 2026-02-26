import { ErrorMessage, Field, Form, Formik } from "formik";
import { Col, Modal, ModalHeader, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { createContract } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";

import { useLocation } from "react-router-dom";
const Contract = ({ modal, setModal }: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const convertToNumber = (value: any) => {
    return !isNaN(parseFloat(value)) ? parseFloat(value) : 0;
  };
  const handleSubmit = async (formField: any) => {
    try {
      const body = {
        contractInfo: {
          loanId: formField.loanId,
          contractDate: formField.contractDate,
          amountFinanced: convertToNumber(formField.amountFinanced),
          terms: formField.terms,
          rate: convertToNumber(formField.rate),
          maturityDate: formField.maturityDate,
          firstPaymentDate: formField.firstPaymentDate,
          baloonMethod: convertToNumber(formField.baloonMethod),
          baloonAmount: convertToNumber(formField.baloonAmount),
          financeCharge: convertToNumber(formField.financeCharge),
          totalOfPayments: convertToNumber(formField.totalOfPayments),
          downPayment: convertToNumber(formField.downPayment),
          totalSalePrice: convertToNumber(formField.totalSalePrice),
          paymentAmount: convertToNumber(formField.paymentAmount),
          finalPaymentAmount: convertToNumber(formField.finalPaymentAmount),
          residualDays: convertToNumber(formField.residualDays),
          indexType: convertToNumber(formField.indexType),
          indexRate: convertToNumber(formField.indexRate),
        },
        advanceDetails: {
          loanId: formField.loanId,
          minInitialAdvAmount: convertToNumber(formField.minInitialAdvAmount),
          maxInitialAdvAmount: convertToNumber(formField.maxInitialAdvAmount),
          minAdvanceAmount: convertToNumber(formField.minAdvanceAmount),
          maxAdvanceAmount: convertToNumber(formField.maxAdvanceAmount),
          multiDisbursmentAllowed:
            formField.multiDisbursmentAllowed == "1" ? true : false,
          drawEndDate: formField.drawEndDate,
          drawTermBillingInd: formField.drawTermBillingInd,
          billingMethod: convertToNumber(formField.billingMethod),
          drawPeriodInterestRate: convertToNumber(
            formField.drawPeriodInterestRate
          ),
          lateChargeAllowed: formField.lateChargeAllowed == "1" ? true : false,
        },
        billingDetails: {
          loanId: formField.loanId,
          billingCycle: formField.billingCycle,
          preBillingDays: convertToNumber(formField.preBillingDays),
          multipleBillingAssetRate: convertToNumber(
            formField.multipleBillingAssetRate
          ),
        },
        bankInfoDetails: {
          loanId: formField.loanId,
          iban: formField.iban,
          accountTitle: formField.accountTitle,
          bankName: formField.bankName,
        },
      };

      const res = await createContract(body);
      if (res) {
        toast.success(res?.data?.notificationMessage);
        navigate(`edit/${formField.loanId}`);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const enums = {
    BaloonMethod: [
      { value: 1, label: "Annual" },
      { value: 2, label: "BiAnnual" },
      { value: 3, label: "Monthly" },
    ],
    IndexType: [
      { value: 1, label: "A" },
      { value: 2, label: "B" },
      { value: 3, label: "C" },
    ],
    BillingMethod: [
      { value: 1, label: "Card" },
      { value: 2, label: "Wallet" },
      { value: 3, label: "Cash" },
    ],
    allowed: [
      { value: 1, label: "True" },
      { value: 2, label: "False" },
    ],
  };

  return (
    <>
      <Modal
        size="lg"
        show={modal}
        onHide={() => {
          setModal(false);
        }}
      >
        <ModalHeader closeButton>
          <h3>Generate Contract</h3>
        </ModalHeader>

        <Formik
          initialValues={{
            loanId: "",
            contractDate: "",
            amountFinanced: 0,
            terms: "",
            rate: 0,
            maturityDate: "",
            firstPaymentDate: "",
            baloonMethod: 0,
            baloonAmount: 0,
            financeCharge: 0,
            totalOfPayments: 0,
            downPayment: 0,
            totalSalePrice: 0,
            paymentAmount: 0,
            finalPaymentAmount: 0,
            residualDays: 0,
            indexType: 0,
            indexRate: 0,
            minInitialAdvAmount: 0,
            maxInitialAdvAmount: 0,
            minAdvanceAmount: 0,
            maxAdvanceAmount: 0,
            multiDisbursmentAllowed: true,
            drawEndDate: "",
            drawTermBillingInd: "",
            billingMethod: 0,
            drawPeriodInterestRate: 0,
            lateChargeAllowed: true,
            billingCycle: "",
            multipleBillingAssetRate: 0,
            iban: "",
            accountTitle: "",
            bankName: "",
          }}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ handleChange, setFieldValue }) => {
            return (
              <Form>
                <Modal.Body>
                  <Row className="pt-2">
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="relationId"
                        className="mb-1 customer-fs-fw"
                      >
                        Appication ID
                      </label>
                      <Field
                        type="text"
                        placeholder="Relation"
                        id="relationShipType"
                        name="relationShipType"
                        className="form-control"
                      />

                      <ErrorMessage
                        name="relationShipType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label htmlFor="loanId" className="mb-1 customer-fs-fw">
                        Loan ID
                      </label>
                      <Field
                        type="text"
                        placeholder="loanId"
                        id="loanId"
                        name="loanId"
                        className="form-control"
                      />

                      <ErrorMessage
                        name="loanId"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="contractDate"
                        className="mb-1 customer-fs-fw"
                      >
                        Contract Date
                      </label>
                      <Field
                        type="date"
                        placeholder="phone type"
                        id="contractDate"
                        name="contractDate"
                        className="form-control"
                      />

                      <ErrorMessage
                        name="contractDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="amountFinanced"
                        className="mb-1 customer-fs-fw"
                      >
                        Amount Financed
                      </label>
                      <Field
                        placeholder="amount Financed"
                        id="amountFinanced"
                        type="text"
                        name="amountFinanced"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="amountFinanced"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label htmlFor="terms" className="mb-1 customer-fs-fw">
                        Terms
                      </label>
                      <Field
                        placeholder="terms"
                        id="terms"
                        type="text"
                        name="terms"
                        className="form-control"
                      />

                      <ErrorMessage
                        name="terms"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label htmlFor="rate" className="mb-1 customer-fs-fw">
                        Rate
                      </label>
                      <Field
                        placeholder="Rate"
                        id="rate"
                        type="text"
                        name="rate"
                        className="form-control"
                      />

                      <ErrorMessage
                        name="rate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="maturityDate"
                        className="mb-1 customer-fs-fw"
                      >
                        Maturity Date
                      </label>
                      <Field
                        placeholder="maturityDate"
                        id="maturityDate"
                        type="date"
                        name="maturityDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="maturityDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="firstPaymentDate"
                        className="mb-1 customer-fs-fw"
                      >
                        1st Payment Date
                      </label>
                      <Field
                        placeholder="firstPaymentDate"
                        id="firstPaymentDate"
                        className="form-control"
                        type="date"
                        name="firstPaymentDate"
                      />

                      <ErrorMessage
                        name="firstPaymentDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="baloonMethod"
                        className="mb-1 customer-fs-fw"
                      >
                        Ballon Method
                      </label>
                      <Field
                        placeholder="baloonMethod"
                        id="baloonMethod"
                        className="form-control"
                        as="select"
                        name="baloonMethod"
                      >
                        <option value="" label="Select Balllon method" />
                        {enums.BaloonMethod.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>

                      <ErrorMessage
                        name="baloonMethod"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="baloonAmount"
                        className="mb-1 customer-fs-fw"
                      >
                        Ballon Amount
                      </label>
                      <Field
                        placeholder="baloonAmount"
                        id="baloonAmount"
                        className="form-control"
                        type="text"
                        name="baloonAmount"
                      />

                      <ErrorMessage
                        name="baloonAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="financeCharge"
                        className="mb-1 customer-fs-fw"
                      >
                        Finance Charge
                      </label>
                      <Field
                        placeholder="financeCharge"
                        id="financeCharge"
                        className="form-control"
                        type="text"
                        name="financeCharge"
                      />

                      <ErrorMessage
                        name="financeCharge"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="totalOfPayments"
                        className="mb-1 customer-fs-fw"
                      >
                        Total of Payments
                      </label>
                      <Field
                        placeholder="totalOfPayments"
                        id="totalOfPayments"
                        className="form-control"
                        type="text"
                        name="totalOfPayments"
                      />

                      <ErrorMessage
                        name="totalOfPayments"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="downPayment"
                        className="mb-1 customer-fs-fw"
                      >
                        Down Payments
                      </label>
                      <Field
                        placeholder="downPayment"
                        id="downPayment"
                        className="form-control"
                        type="text"
                        name="downPayment"
                      />

                      <ErrorMessage
                        name="totalOfPayments"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>

                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="totalSalePrice"
                        className="mb-1 customer-fs-fw"
                      >
                        Total Sale Price
                      </label>
                      <Field
                        placeholder="End Time"
                        id="totalSalePrice"
                        className="form-control"
                        type="text"
                        name="totalSalePrice"
                      />

                      <ErrorMessage
                        name="totalSalePrice"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="paymentAmount"
                        className="mb-1 customer-fs-fw"
                      >
                        Payment Amount
                      </label>
                      <Field
                        placeholder="paymentAmount"
                        id="paymentAmount"
                        className="form-control"
                        type="text"
                        name="paymentAmount"
                      />

                      <ErrorMessage
                        name="paymentAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="finalPaymentAmount"
                        className="mb-1 customer-fs-fw"
                      >
                        Final Payment Amount
                      </label>
                      <Field
                        placeholder="finalPaymentAmount"
                        id="finalPaymentAmount"
                        className="form-control"
                        type="text"
                        name="finalPaymentAmount"
                      />

                      <ErrorMessage
                        name="finalPaymentAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="residualDays"
                        className="mb-1 customer-fs-fw"
                      >
                        Residual Days
                      </label>
                      <Field
                        placeholder="residualDays"
                        id="residualDays"
                        className="form-control"
                        type="text"
                        name="residualDays"
                      />

                      <ErrorMessage
                        name="residualDays"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2">
                      <label
                        htmlFor="indexType"
                        className="mb-1 customer-fs-fw"
                      >
                        Index Type
                      </label>
                      <Field
                        placeholder="indexType"
                        id="indexType"
                        className="form-control"
                        as="select"
                        name="indexType"
                      >
                        <option value="" label="Select Index Type" />
                        {enums.IndexType.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>

                      <ErrorMessage
                        name="indexType"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="indexRate"
                        className="mb-1 customer-fs-fw"
                      >
                        Index Rate
                      </label>
                      <Field
                        placeholder="indexRate"
                        id="indexRate"
                        className="form-control"
                        type="text"
                        name="indexRate"
                      />

                      <ErrorMessage
                        name="indexRate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row className="pt-4 border-top">
                    <h3>Advance</h3>
                    <Col md={6} className="mt-2 mb-2">
                      <label htmlFor="endTime" className="mb-1 customer-fs-fw">
                        Loan ID
                      </label>
                      <Field
                        placeholder="loanId"
                        id="loanId"
                        className="form-control"
                        type="text"
                        name="loanId"
                      />

                      <ErrorMessage
                        name="loanId"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="minInitialAdvAmount"
                        className="mb-1 customer-fs-fw"
                      >
                        Min Initial Advance Amount
                      </label>
                      <Field
                        placeholder="minInitialAdvAmount"
                        id="minInitialAdvAmount"
                        className="form-control"
                        type="text"
                        name="minInitialAdvAmount"
                      />

                      <ErrorMessage
                        name="minInitialAdvAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="maxInitialAdvAmount"
                        className="mb-1 customer-fs-fw"
                      >
                        Max Initial Advance Amount
                      </label>
                      <Field
                        placeholder="maxInitialAdvAmount"
                        id="maxInitialAdvAmount"
                        className="form-control"
                        type="text"
                        name="maxInitialAdvAmount"
                      />

                      <ErrorMessage
                        name="maxInitialAdvAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="minAdvanceAmount"
                        className="mb-1 customer-fs-fw"
                      >
                        Min Advance Amount
                      </label>
                      <Field
                        placeholder=" minAdvanceAmount"
                        id="minAdvanceAmount"
                        className="form-control"
                        type="text"
                        name="minAdvanceAmount"
                      />

                      <ErrorMessage
                        name="minAdvanceAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="maxAdvanceAmount"
                        className="mb-1 customer-fs-fw"
                      >
                        Max Advance Amount
                      </label>
                      <Field
                        placeholder="maxAdvanceAmount"
                        id="maxAdvanceAmount"
                        className="form-control"
                        type="text"
                        name="maxAdvanceAmount"
                      />

                      <ErrorMessage
                        name="maxAdvanceAmount"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="multiDisbursmentAllowed"
                        className="mb-1 customer-fs-fw"
                      >
                        Multi Disbursement Allowed
                      </label>
                      <Field
                        as="select"
                        id="multiDisbursmentAllowed"
                        name="multiDisbursmentAllowed"
                        className="form-control"
                      >
                        <option value="" label="Select Index Type" />
                        {enums.allowed.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>

                      <ErrorMessage
                        name="multiDisbursmentAllowed"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="drawEndDate"
                        className="mb-1 customer-fs-fw"
                      >
                        Draw End Date
                      </label>
                      <Field
                        placeholder="drawEndDate "
                        id="drawEndDate"
                        className="form-control"
                        type="date"
                        name="drawEndDate"
                      />

                      <ErrorMessage
                        name="drawEndDate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="drawTermBillingInd"
                        className="mb-1 customer-fs-fw"
                      >
                        Draw Term Billing Ind
                      </label>
                      <Field
                        placeholder=" drawTermBillingInd"
                        id="drawTermBillingInd"
                        className="form-control"
                        type="text"
                        name="drawTermBillingInd"
                      />

                      <ErrorMessage
                        name="drawTermBillingInd"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="billingMethod"
                        className="mb-1 customer-fs-fw"
                      >
                        Billing Method
                      </label>
                      <Field
                        placeholder=" billingMethod"
                        id="billingMethod"
                        className="form-control"
                        as="select"
                        name="billingMethod"
                      >
                        <option value="" label="Select billing method" />
                        {enums.BillingMethod.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>

                      <ErrorMessage
                        name="billingMethod"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="drawPeriodInterestRate"
                        className="mb-1 customer-fs-fw"
                      >
                        Draw Period Interest Rate
                      </label>
                      <Field
                        placeholder="drawPeriodInterestRateme"
                        id="drawPeriodInterestRate"
                        className="form-control"
                        type="text"
                        name="drawPeriodInterestRate"
                      />

                      <ErrorMessage
                        name="drawPeriodInterestRate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="lateChargeAllowed"
                        className="mb-1 customer-fs-fw"
                      >
                        Late Charge
                      </label>
                      <Field
                        as="select"
                        id="lateChargeAllowed"
                        name="lateChargeAllowed"
                        className="form-control"
                      >
                        <option value="" label="Select late charge " />
                        {enums.allowed.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="lateChargeAllowed"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row className="pt-2 border-top">
                    <h3>Billing</h3>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="billingCycle"
                        className="mb-1 customer-fs-fw"
                      >
                        Billing Cycle
                      </label>
                      <Field
                        placeholder=" billingCycle"
                        id="billingCycle"
                        className="form-control"
                        type="text"
                        name="billingCycle"
                      />

                      <ErrorMessage
                        name="billingCycle"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="preBillingDays"
                        className="mb-1 customer-fs-fw"
                      >
                        Pre Billed Days
                      </label>
                      <Field
                        placeholder=" preBillingDays"
                        id="preBillingDays"
                        className="form-control"
                        type="text"
                        name="preBillingDays"
                      />

                      <ErrorMessage
                        name="preBillingDays"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="multipleBillingAssetRate"
                        className="mb-1 customer-fs-fw"
                      >
                        Multiple Billing Asset Rate
                      </label>
                      <Field
                        placeholder=" multipleBillingAssetRate"
                        id="multipleBillingAssetRate"
                        className="form-control"
                        type="text"
                        name="multipleBillingAssetRate"
                      />

                      <ErrorMessage
                        name="multipleBillingAssetRate"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>
                  <Row className="pt-2 border-top">
                    <h3>Bank Information</h3>
                    <Col md={6} className="mt-2 mb-2">
                      <label htmlFor="iban" className="mb-1 customer-fs-fw">
                        IBAN
                      </label>
                      <Field
                        placeholder=" iban"
                        id="iban"
                        className="form-control"
                        type="text"
                        name="iban"
                      />

                      <ErrorMessage
                        name="iban"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label
                        htmlFor="accountTitle"
                        className="mb-1 customer-fs-fw"
                      >
                        Account Title
                      </label>
                      <Field
                        placeholder="accountTitle"
                        id="accountTitle"
                        className="form-control"
                        type="text"
                        name="accountTitle"
                      />

                      <ErrorMessage
                        name="accountTitle"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                    <Col md={6} className="mt-2 mb-2">
                      <label htmlFor="bankName" className="mb-1 customer-fs-fw">
                        Bank Name
                      </label>
                      <Field
                        placeholder=" bankName"
                        id="bankName"
                        className="form-control"
                        type="text"
                        name="bankName"
                      />

                      <ErrorMessage
                        name="bankName"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </Col>
                  </Row>

                  <div className="d-flex mt-4 justify-content-end ">
                    <button className="theme-btn-next" type="submit">
                      {/* {editRowId ? "Update Preferences" : "Add Preferences"} */}
                      Generate
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </>
  );
};
export default Contract;
