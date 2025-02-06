import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip"; // Import JSZip to create zip files
import "../styles/pages.css";

const CompressPDF = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [zipBlob, setZipBlob] = useState(null);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...newFiles]);
    setError(""); // Clear previous errors
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const newFiles = Array.from(event.dataTransfer.files);
    setSelectedFiles([...selectedFiles, ...newFiles]);
    setError(""); // Clear previous errors
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleCompress = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to compress.");
      return;
    }

    try {
      // Create a new zip file
      const zip = new JSZip();

      for (const file of selectedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // Create a new PDF to store compressed pages
        const compressedPdf = await PDFDocument.create();

        // Copy all pages from the original PDF and scale them for compression
        const copiedPages = await compressedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => {
          const { width, height } = page.getSize();
          const scale = 0.75; // Adjust scale to compress
          page.setSize(width * scale, height * scale);
          compressedPdf.addPage(page);
        });

        // Save the compressed PDF as bytes
        const compressedPdfBytes = await compressedPdf.save();
        const compressedPdfBlob = new Blob([compressedPdfBytes], { type: "application/pdf" });

        // Add the compressed PDF to the zip file
        zip.file(file.name, compressedPdfBlob);
      }

      // Generate the zip file as a Blob
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Set the zip file Blob for downloading
      setZipBlob(zipBlob);
      setError(""); // Clear previous errors
    } catch (error) {
      setError("An error occurred while compressing the files. Please try again.");
      console.error("Compression error:", error);
    }
  };

  const handleDownload = () => {
    if (zipBlob) {
      const link = document.createElement("a");
      const url = URL.createObjectURL(zipBlob);
      link.href = url;
      link.download = "compressed_files.zip"; // Name the zip file
      link.click();
      URL.revokeObjectURL(url); // Clean up the URL object
    }
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
    setZipBlob(null);
    setError("");
  };

  return (
    <div className="compress-pdf-container">
      <h1>Compress PDF Tool</h1>
      <p>Upload your Files/Folders to make ZIP file.</p>

      {/* Display Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* Drag-and-Drop Area */}
      <div
        className="dropbox"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag and drop your files here</p>
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
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Buttons */}
      <div className="action-buttons">
        {selectedFiles.length > 0 && (
          <>
            <button onClick={handleCompress} className="compress-button">
              Compress PDFs
            </button>
            <button onClick={handleClearFiles} className="clear-button">
              Clear Files
            </button>
          </>
        )}
        {zipBlob && (
          <button onClick={handleDownload} className="download-button">
            Download Compressed ZIP
          </button>
        )}
      </div>
    </div>
  );
};

export default CompressPDF;
