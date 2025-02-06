import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages.css";

const PowerPointToPDF = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Handle file change from the input field
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    navigate("/convert-powerpoint-to-pdf", { state: { files } });
  };

  // Handle drag-and-drop events
  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
    navigate("/convert-powerpoint-to-pdf", { state: { files } });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="powerpoint-to-pdf-container">
      <h1>PowerPoint to PDF Tool</h1>
      <p>Convert your PowerPoint presentations to PDF easily with this tool.</p>

      {/* Drag-and-Drop Area */}
      <div
        className="dropbox"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag and drop your PowerPoint files here</p>
        <p>or</p>
        <label className="file-upload-button">
          Select Files
          <input
            type="file"
            accept=".ppt, .pptx"
            multiple
            onChange={handleFileChange}
            hidden
          />
        </label>
      </div>
    </div>
  );
};

export default PowerPointToPDF;
