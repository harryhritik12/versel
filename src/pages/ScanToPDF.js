import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "../styles/pages.css";

const ScanToPDF = () => {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const reorderFiles = (index, direction) => {
    const newFiles = [...files];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newFiles.length) {
      const [movedItem] = newFiles.splice(index, 1);
      newFiles.splice(targetIndex, 0, movedItem);
      setFiles(newFiles);
    }
  };

  const generatePDF = () => {
    const pdf = new jsPDF();

    files.forEach((file, index) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imgData = e.target.result;
        if (index > 0) pdf.addPage(); // Add new page for every image except the first
        pdf.addImage(imgData, "JPEG", 10, 10, 180, 160); // Adjust size as necessary
        if (index === files.length - 1) {
          pdf.save("scanned-documents.pdf"); // Save the generated PDF
        }
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="scan-to-pdf-container">
      <h1>Scan to PDF Tool</h1>
      <p>Upload your scanned images or documents to generate a PDF.</p>

      {/* Drag-and-Drop Area */}
      <div
        className="dropbox"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag and drop your scanned images here</p>
        <p>or</p>
        <label className="file-upload-button">
          Select Files
          <input
            type="file"
            accept="image/jpeg, image/png"
            multiple
            onChange={handleFileChange}
            hidden
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="file-preview">
          <h3>Uploaded Files:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name}
                <button onClick={() => reorderFiles(index, -1)}>Move Up</button>
                <button onClick={() => reorderFiles(index, 1)}>Move Down</button>
              </li>
            ))}
          </ul>
          <button onClick={generatePDF}>Generate PDF</button>
        </div>
      )}
    </div>
  );
};

export default ScanToPDF;
