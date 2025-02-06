import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/pages.css";

const ConvertPDFToPowerPoint = () => {
  const location = useLocation();
  const selectedFiles = location.state?.files || [];
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert("No files selected for conversion.");
      return;
    }

    setIsConverting(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFiles[0]); // Handle the first file for simplicity

      // Send the file to the backend for conversion
      const response = await axios.post("http://localhost:5000/convert", formData, {
        responseType: "blob", // Ensure the response is received as a Blob
      });

      // Create a URL for the converted file Blob
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));

      // Create a hidden <a> element to download the file
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", "converted.pptx"); // Name of the downloaded file
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the DOM

      alert("Conversion successful! The file has been downloaded.");
    } catch (error) {
      console.error("Conversion error:", error);
      alert("An error occurred during the conversion.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="convert-pdf-to-powerpoint-container">
      <h1>Convert PDF to PowerPoint</h1>
      {selectedFiles.length > 0 ? (
        <div>
          <p>Files ready for conversion:</p>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No files selected.</p>
      )}

      <div className="action-buttons">
        <button
          className="convert-button"
          onClick={handleConvert}
          disabled={isConverting}
        >
          {isConverting ? "Converting..." : "Convert to PowerPoint"}
        </button>
      </div>
    </div>
  );
};

export default ConvertPDFToPowerPoint;
