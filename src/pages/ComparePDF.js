import React, { useState } from 'react';
import "../styles/pages.css";

const ComparePDF = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [comparisonResult, setComparisonResult] = useState(null);

  // Handle file selection
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 2) {
      setSelectedFiles(files);
      setError(""); // Clear error
    } else {
      setError("Please upload exactly two PDF files to compare.");
    }
  };

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length + selectedFiles.length > 2) {
      setError("You can only upload two PDF files to compare.");
      return;
    }
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    setError(""); // Clear any existing errors
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Remove a file from the list
  const removeFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Clear the selected files
  const clearFiles = () => {
    setSelectedFiles([]);
    setError(""); // Clear any error when files are cleared
  };

  // Function to compare PDFs by sending them to the backend
  const comparePdfs = async () => {
    if (selectedFiles.length === 2) {
      const formData = new FormData();
      formData.append("pdfs", selectedFiles[0]);
      formData.append("pdfs", selectedFiles[1]);

      try {
        const response = await fetch("https://versel-rxs2.onrender.com/compare", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setComparisonResult(result);
        } else {
          setComparisonResult({ status: 'error', message: result.message });
        }
      } catch (error) {
        console.error("Error comparing PDFs:", error);
        setComparisonResult({ status: 'error', message: "Error comparing PDFs." });
      }
    } else {
      setError("Please upload exactly two PDF files to compare.");
    }
  };

  return (
    <div className="compare-pdf-container">
      <h1>Compare PDF Tool</h1>
      <p>Upload two PDF files to compare their content side by side.</p>

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* Drag-and-Drop Area */}
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

      {/* Display Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="file-list">
          <h3>Selected Files:</h3>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>
                {file.name}{" "}
                <button
                  onClick={() => removeFile(index)}
                  className="remove-file-button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button className="clear-button" onClick={clearFiles}>
            Clear All
          </button>
        </div>
      )}

      {/* Side-by-Side PDF Preview Section */}
      {selectedFiles.length === 2 && (
        <div className="pdf-preview-grid">
          <div className="pdf-preview">
            <h3>PDF 1</h3>
            <iframe
              src={URL.createObjectURL(selectedFiles[0])}
              title="PDF 1"
              className="pdf-iframe"
              frameBorder="0"
            ></iframe>
          </div>
          <div className="pdf-preview">
            <h3>PDF 2</h3>
            <iframe
              src={URL.createObjectURL(selectedFiles[1])}
              title="PDF 2"
              className="pdf-iframe"
              frameBorder="0"
            ></iframe>
          </div>
        </div>
      )}

      {/* Compare Button */}
      {selectedFiles.length === 2 && (
        <div className="compare-action">
          <button className="compare-button" onClick={comparePdfs}>
            Compare PDFs
          </button>
        </div>
      )}

      {/* Show Comparison Result */}
      {comparisonResult && (
        <div className="comparison-result">
          <h3>Comparison Result</h3>
          {comparisonResult.success ? (
            <div>
              <p>{comparisonResult.areIdentical ? "The PDFs are identical!" : "The PDFs are not identical."}</p>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>PDF 1 Content</th>
                    <th>PDF 2 Content</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonResult.differences.map((diff, index) => (
                    <tr key={index}>
                      <td>{diff.line}</td>
                      <td>{diff.pdf1}</td>
                      <td>{diff.pdf2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>{comparisonResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ComparePDF;
