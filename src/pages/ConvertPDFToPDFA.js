import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import "../styles/pages.css"; // Add your custom CSS here if needed

const ConvertPDFToPDFA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedFiles = location.state?.files || [];
  const [conversionResult, setConversionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect back if no files are passed
    if (!location.state?.files) {
      navigate("/"); // Adjust to your landing route
    }
  }, [location.state, navigate]);

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert("No files to convert.");
      return;
    }

    setIsLoading(true);
    try {
      alert("Converting PDF files to PDF/A...");
      const formData = new FormData();
      formData.append("pdf", selectedFiles[0]); // Assuming the first file

      const response = await axios.post("http://localhost:5000/convert-pdfa", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle successful conversion response
      setConversionResult(response.data.filePath);
      alert("Conversion successful!");
    } catch (error) {
      console.error("Error during conversion:", error);
      alert("Failed to convert the file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (conversionResult) {
      // Create a hidden <a> element to trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = `http://localhost:5000${conversionResult}`;
      downloadLink.download = 'converted_file.pdf'; // Specify the filename here
      document.body.appendChild(downloadLink); // Append to the body (required for Firefox)
      downloadLink.click(); // Simulate click to start download
      document.body.removeChild(downloadLink); // Remove the link from the document
    } else {
      alert("No converted file available.");
    }
  };

  return (
    <div className="convert-pdf-to-pdfa-container">
      <h1>Convert PDF to PDF/A</h1>
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
      {selectedFiles.length > 0 && (
        <div className="action-buttons">
          <button className="convert-button" onClick={handleConvert} disabled={isLoading}>
            {isLoading ? "Converting..." : "Convert to PDF/A"}
          </button>
          <button className="download-button" onClick={handleDownload} disabled={!conversionResult}>
            Download PDF/A
          </button>
        </div>
      )}
    </div>
  );
};

export default ConvertPDFToPDFA;