import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages.css";

const PDFToPDFA = () => {
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    navigate("/convert-pdf-to-pdfa", { state: { files } });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    navigate("/convert-pdf-to-pdfa", { state: { files } });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="pdf-to-pdfa-container">
      <h1>PDF to PDF/A Tool</h1>
      <p>Convert your PDF files to PDF/A format for long-term archival.</p>

      <div
        className="dropbox"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag and drop your PDF files here</p>
        <p>or</p>
        <label className="file-upload-button">
          Select Files
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
            hidden
          />
        </label>
      </div>
    </div>
  );
};

export default PDFToPDFA;
