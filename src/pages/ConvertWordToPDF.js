import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/pages.css";

const ConvertWordToPDF = () => {
  const location = useLocation();
  const selectedFiles = location.state?.files || [];
  const [convertedFiles, setConvertedFiles] = useState({});
  const [convertingFiles, setConvertingFiles] = useState({}); // Track conversion progress

  const handleConvert = async (file) => {
    if (!file) return;

    // Mark file as converting
    setConvertingFiles((prev) => ({ ...prev, [file.name]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("https://docker-lv55.onrender.com/convert", formData, {
        responseType: "blob",
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setConvertedFiles((prev) => ({ ...prev, [file.name]: url }));
      alert(`${file.name} has been converted!`);
    } catch (error) {
      console.error("Error during conversion:", error);
      alert(`Error converting ${file.name}: ` + error.message);
    } finally {
      // Remove file from converting state
      setConvertingFiles((prev) => ({ ...prev, [file.name]: false }));
    }
  };

  const handleDownload = (fileName) => {
    const url = convertedFiles[fileName];
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName.replace(/\.[^/.]+$/, "")}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  return (
    <div className="convert-word-to-pdf-container">
      <h1>Convert Word to PDF</h1>
      <p>Files ready for conversion:</p>
      {selectedFiles.length > 0 ? (
        <ul>
          {selectedFiles.map((file, index) => (
            <li key={index}>
              {file.name}
              <div className="action-buttons">
                <button
                  className="convert-button"
                  onClick={() => handleConvert(file)}
                  disabled={!!convertedFiles[file.name] || convertingFiles[file.name]}
                >
                  {convertingFiles[file.name] ? "Converting..." : "Convert to PDF"}
                </button>
                <button
                  className="download-button"
                  onClick={() => handleDownload(file.name)}
                  disabled={!convertedFiles[file.name]}
                >
                  Download PDF
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No files selected.</p>
      )}
    </div>
  );
};

export default ConvertWordToPDF;
