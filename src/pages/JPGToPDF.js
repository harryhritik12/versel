import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages.css";

const JPGToPDF = () => {
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      navigate("/convert-pdf", { state: { files: validFiles } });
    } else {
      alert("Please select valid image files (JPEG, PNG, GIF, TIFF, WEBP).");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      navigate("/convert-pdf", { state: { files: validFiles } });
    } else {
      alert("Please drop valid image files (JPEG, PNG, GIF, TIFF, WEBP).");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const validateFiles = (files) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/tiff",
      "image/webp",
    ];
    return files.filter((file) => allowedTypes.includes(file.type));
  };

  return (
    <div className="jpg-to-pdf-container">
      <h1>Image to PDF Tool</h1>
      <p>Convert your Images to PDF easily with this tool.</p>

      <div
        className="dropbox"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag and drop your JPEG, PNG, GIF, TIFF, WEBP Images here</p>
        <p>or</p>
        <label className="file-upload-button">
          Select Files
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/tiff,image/webp"
            multiple
            onChange={handleFileChange}
            hidden
          />
        </label>
      </div>
    </div>
  );
};

export default JPGToPDF;
