import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const ConvertPPTtoPDF = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [convertedFileUrl, setConvertedFileUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Get the files passed from the previous component
  useEffect(() => {
    if (location.state && location.state.files) {
      setSelectedFiles(location.state.files);
    }
  }, [location.state]);

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select a PPT file to convert.");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("file", file);
      });

      // Send the file(s) to the backend for conversion
      const response = await axios.post("http://localhost:5000/convert", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob", // Important to handle binary file response
      });

      // Create a temporary URL for the converted file (e.g., PDF)
      const fileUrl = URL.createObjectURL(response.data);
      setConvertedFileUrl(fileUrl);
      setErrorMessage(""); // Reset error message if conversion is successful
    } catch (error) {
      console.error("Error details: ", error);
      setErrorMessage("Error during conversion: " + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!convertedFileUrl) {
      alert("No converted file available.");
      return;
    }

    // Open the download link in a new tab
    const link = document.createElement("a");
    link.href = convertedFileUrl;
    link.download = "converted_presentation.pdf"; // Default file name for PDF download
    link.click();
  };

  return (
    <div className="convert-ppt-to-pdf-container">
      <h1>Convert PPT to PDF</h1>
      <div>
        {selectedFiles.length === 0 ? (
          <p>No PowerPoint files selected for conversion.</p>
        ) : (
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="action-buttons">
        <button
          className="convert-button"
          onClick={handleConvert}
          disabled={isLoading}
        >
          {isLoading ? "Converting..." : "Convert to PDF"}
        </button>
        <button
          className="download-button"
          onClick={handleDownload}
          disabled={!convertedFileUrl || isLoading}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ConvertPPTtoPDF;
