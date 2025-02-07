import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/pages.css";

const ConvertPDFToExcel = () => {
  const location = useLocation();
  const selectedFiles = location.state?.files || [];
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert("No files selected for conversion.");
      return;
    }

    setIsConverting(true);

    const formData = new FormData();
    formData.append("file", selectedFiles[0]);

    try {
      const response = await axios.post(
        "https://docker-lv55.onrender.com/convert-to-excel",
        formData,
        { responseType: "blob" }
      );

      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      setConvertedFile({
        name: selectedFiles[0].name.replace(".pdf", ".xlsx"),
        url: fileURL,
      });

      alert("Conversion successful! You can now download the Excel file.");
    } catch (error) {
      console.error("Error during conversion:", error);
      alert("An error occurred while converting the file.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (convertedFile) {
      const link = document.createElement("a");
      link.href = convertedFile.url;
      link.setAttribute("download", convertedFile.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setConvertedFile(null);
      setIsDownloading(false);
    }
  };

  return (
    <div className="convert-pdf-to-excel-container">
      <h1>Convert PDF to Excel</h1>
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
        <button
          className="convert-button"
          onClick={handleConvert}
          disabled={isConverting}
        >
          {isConverting ? "Converting..." : "Convert to Excel"}
        </button>

        {convertedFile && (
          <button
            className="download-button"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            Download Excel
          </button>
        )}
      </div>
    </div>
  );
};

export default ConvertPDFToExcel;
