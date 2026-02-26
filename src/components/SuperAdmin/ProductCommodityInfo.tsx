import { Form as BootstrapForm, Row, Col, Button } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";

function ProductCommodityInfo({productId, onSuccess,productData, isEditable}) {
  const location = useLocation();
  const pathtype = location.pathname.split("/").filter(Boolean)[0];

  const initialValues = {
    isCommodity: true,
    productId: productId,
  };
  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if(pathtype==='edit'){
       onSuccess();
      }else{
       onSuccess();
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
   <>
     <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize={true} 
    >
      {({ isSubmitting, values, setFieldValue, errors, touched }) => (
        <Form>
          <div className="tab-form-content">
          <Row className="mb-3">
              <BootstrapForm.Group
                controlId="isCommodity"
                className="d-flex align-items-center"
              >
                <Field
                  as={BootstrapForm.Check}
                  type="checkbox"
                  name="isCommodity"
                  checked={values.isCommodity}
                  disabled={!isEditable}
                  onChange={() => setFieldValue("isCommodity", !values.isCommodity)}
                  className="me-2"
                />
                <BootstrapForm.Label className="mb-0">
                  Has Commodity
                </BootstrapForm.Label>
              </BootstrapForm.Group>
            </Row>
          </div>
          {
            isEditable && (
          <div className="d-flex justify-content-end pt-4">
            <Button
              type="submit"
              className="theme-btn-next"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Next"}
            </Button>
          </div>
            )
          }
        </Form>
      )}
    </Formik>
   </>
  )
}

export default ProductCommodityInfo