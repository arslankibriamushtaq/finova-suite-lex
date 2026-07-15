import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useTranslation } from "react-i18next";

const PromissoryNoteInfo = ({ setSelectedTab }: any) => {
  const { t } = useTranslation("partner");
  const [imageFile, setImageFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    if (!imageFile) return;

    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set black background
      doc.setFillColor(0, 0, 0); // RGB black
      doc.rect(0, 0, 210, 297, "F"); // A4 full black rectangle

      // Image size
      const imgWidth = 180;
      const imgHeight = (img.height * imgWidth) / img.width;

      // Add image centered on black background
      const x = (210 - imgWidth) / 2;
      const y = (197 - imgHeight) / 2;
      doc.addImage(img, "PNG", x, y, imgWidth, imgHeight);

      const blob = doc.output("blob");
      const url: any = URL.createObjectURL(blob);
      setPdfUrl(url);
    };
  }, [imageFile]);

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
    } else {
      alert(t("epromissory.invalidImage"));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <input
        id="file-upload-button"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {pdfUrl && (
        <div style={{ height: "85vh", marginTop: "20px" }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
        </div>
      )}
    </div>
  );
};

export default PromissoryNoteInfo;
