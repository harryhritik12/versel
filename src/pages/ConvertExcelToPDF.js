import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/pages.css";

const ConvertExcelToPDF = () => {
  const location = useLocation();
  const selectedFiles = location.state?.files || [];
  const [pdfBlob, setPdfBlob] = useState(null);

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert("No files to convert.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFiles[0]); // Assuming single file for simplicity

    try {
      const response = await axios.post("http://localhost:5000/convert", formData, {
        responseType: "blob",
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPdfBlob(new Blob([response.data], { type: "application/pdf" }));
      alert("Conversion completed. You can now download the PDF.");
    } catch (error) {
      console.error("Error converting file:", error);
      alert("Failed to convert the file.");
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) {
      alert("Please convert the file first.");
      return;
    }

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="convert-excel-to-pdf-container">
      <h1>Convert Excel to PDF</h1>
      <p>Files ready for conversion:</p>
      {selectedFiles.length > 0 ? (
        <ul>
          {selectedFiles.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      ) : (
        <p>No files selected.</p>
      )}
      <div className="action-buttons">
        <button className="convert-button" onClick={handleConvert}>
          Convert to PDF
        </button>
        <button className="download-button" onClick={handleDownload} disabled={!pdfBlob}>
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ConvertExcelToPDF;
