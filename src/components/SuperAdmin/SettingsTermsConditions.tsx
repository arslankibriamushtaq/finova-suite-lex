import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Button, Col, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  addTermsAndConditions,
  updateTermsAndConditions,
} from "../../redux/apis/apisTenantCrud";
import React, { useEffect, useState } from "react";

const SettingsTermsConditions = ({
  setActiveTab,
  productId,
  productData,
  isEditable,
  onSuccess,
}) => {
  const [termData, setTermData] = useState<any>([
    // { key:"Disclaimer (EN)", value:""},
    // { key:"Disclaimer (AR)",value:""}
  ]);
  const [isNewData, setIsNewData] = useState(false);

  // Handle CKEditor content change
  const handleChange = (key: string, editor: any) => {
    const newValue = editor.getData(); // Get the updated data from CKEditor
    setTermData((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, value: newValue } : item
      )
    );
  };
  useEffect(() => {
    if (productData?.termsAndConditions?.length>0) {
      setTermData(productData.termsAndConditions);
      setIsNewData(false);
    } else {
      setTermData([
        {
          id: "1",
          key: "Disclaimer (EN)",
          value: "",
        },
        {
          id: "2",
          key: "Disclaimer (AR)",
          value: "",
        },
      ]);
      setIsNewData(true);
    }
  }, [productData, productId]);

  const handleSave = async () => {
    const apiCall = isNewData
      ? addTermsAndConditions
      : updateTermsAndConditions;
    const actionText = isNewData ? "Adding" : "Updating";
    const payload = {
      productId: termData[0].productId,
      contents: termData.map((item) => ({
        key: item.key,
        value: item.value,
      })),
    };
    toast.promise(apiCall(payload), {
      loading: `${actionText} Terms & Conditions...`,
      success: (response) => {
        if (response?.data?.notificationMessage === "Operation successful.") {
          setActiveTab("Application Fees");
          onSuccess(productId);
          return "Terms & Conditions updated successfully!";
        } else {
          throw new Error(
            response?.data?.notificationMessage || "Unknown error"
          );
        }
      },
      error: (error) => error?.message || "Something went wrong",
    });
  };
  // Function to handle Label (Key) change
  const handleLabelChange = (index: number, newLabel: string) => {
    setTermData((prevData) =>
      prevData.map((item, i) =>
        i === index ? { ...item, key: newLabel } : item
      )
    );
  };

  // Function to add two new fields dynamically
  const addNewFields = () => {
    setTermData((prevData) => [
      ...prevData,
      { key: "", value: "" },
      { key: "", value: "" },
    ]);
  };
  const handleDeleteRow = (indexToRemove: number) => {
    setTermData((prevData) =>
      prevData.filter(
        (_, index) => index !== indexToRemove && index !== indexToRemove + 1
      )
    );
  };

  return (
    <div className="container-fluid">
      {termData.map(
        (item, index) =>
          index % 2 === 0 && ( // Ensures two editors per row
            <Row className="mb-4 align-items-center" key={index}>
              <Col>
                <div>
                  {!isEditable || index<2 ? (
                    <label className="editor-label mb-2">
                      {termData[index].key}
                    </label>
                  ) : (
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={termData[index].key}
                      onChange={(e) => handleLabelChange(index, e.target.value)}
                      placeholder="Enter label"
                    />
                  )}

                  <CKEditor
                    // @ts-ignore
                    editor={ClassicEditor}
                    disabled={!isEditable}
                    config={{
                      toolbar: [
                        "bold",
                        "italic",
                        "underline",
                        "bulletedList",
                        "numberedList",
                        "undo",
                        "redo",
                        "-",
                      ],
                    }}
                    data={termData[index].value ?? ""}
                    onChange={(event, editor) =>
                      handleChange(termData[index].key, editor)
                    }
                  />
                </div>
              </Col>
              {termData[index + 1] && (
                <Col>
                  <div>
                    {!isEditable || index<2  ? (
                      <label className="editor-label mb-2">
                        {termData[index + 1].key}
                      </label>
                    ) : (
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={termData[index + 1].key}
                        onChange={(e) =>
                          handleLabelChange(index + 1, e.target.value)
                        }
                        placeholder="Enter label"
                      />
                    )}

                    <CKEditor
                      // @ts-ignore
                      editor={ClassicEditor}
                      disabled={!isEditable}
                      config={{
                        toolbar: [
                          "bold",
                          "italic",
                          "underline",
                          "bulletedList",
                          "numberedList",
                          "undo",
                          "redo",
                          "-",
                        ],
                      }}
                      data={termData[index + 1].value ?? ""}
                      onChange={(event, editor) =>
                        handleChange(termData[index + 1].key, editor)
                      }
                    />
                  </div>
                </Col>
              )}
              {/* Delete button after every two editors, except the first two */}
              {termData.length>2 && (
                <Col md="auto" className="d-flex align-items-end">
                  <button
                    disabled={index<2}
                    className="btn btn-danger mt-2"
                    onClick={() => handleDeleteRow(index)}
                  >
                    ✖
                  </button>
                </Col>
              )}
            </Row>
          )
      )}

     

      {isEditable && (
        <>
        <div className="d-flex justify-content-start">
          <Button
            className="theme-btn-next"
            onClick={addNewFields}
            disabled={!isEditable}
          >
            Add 
          </Button>
         
        </div>
        <div className="d-flex justify-content-end">
         
          <Button className="theme-btn-update" onClick={handleSave}>
            Submit Terms
          </Button>
        </div>
        </>
      )}
    </div>
  );
};

export default SettingsTermsConditions;
