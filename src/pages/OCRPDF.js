import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages.css";

const OCRPDF = () => {
  const navigate = useNavigate();

  // Validate file type (PDF or image types)
  const validateFiles = (files) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    return files.every((file) => allowedTypes.includes(file.type));
  };

  // Handle file selection via input
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (!validateFiles(files)) {
      alert("Please upload valid PDF or image files (JPEG, PNG, JPG, PDF).");
      return;
    }

    navigate("/ocr-pdf-options", { state: { files } });
  };

  // Handle file drop
  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    if (!validateFiles(files)) {
      alert("Please upload valid PDF or image files (JPEG, PNG, JPG, PDF).");
      return;
    }

    navigate("/ocr-pdf-options", { state: { files } });
  };

  // Prevent default behavior for drag-over
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="ocr-pdf-container">
      <h1>OCR PDF Tool</h1>
      <p>
        Upload your scanned or image-based PDF files to make them searchable
        using OCR.
      </p>

      {/* Drag-and-Drop Area */}
      <div
        className="dropbox"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #ccc",
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <p>Drag and drop your image or PDF files here</p>
        <p>or</p>
        <label className="file-upload-button">
          Select Files
          <input
            type="file"
            accept="application/pdf, image/jpeg, image/png, image/jpg"
            multiple
            onChange={handleFileChange}
            hidden
          />
        </label>
      </div>

      {/* Display error messages or additional instructions */}
      <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
        Supported formats: PDF, JPEG, PNG, JPG
      </p>
    </div>
  );
};

export default OCRPDF;