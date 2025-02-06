import React, { useState } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";  // Import rgb and degrees from pdf-lib
import "../styles/pages.css"; // Component-specific styles

const AddWatermark = () => {
  const [selectedFile, setSelectedFile] = useState(null); // Use state for a single file
  const [watermarkText, setWatermarkText] = useState("");
  const [downloadLink, setDownloadLink] = useState(null); // To store a single download link

  // Handle file selection (only one file)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file); // Set only one file
  };

  // Handle file drop (only one file)
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0]; // Get only the first file
    setSelectedFile(file); // Set the dropped file
  };

  // Handle drag over
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handle watermark text change
  const handleWatermarkTextChange = (event) => {
    setWatermarkText(event.target.value);
  };

  // Function to add watermark to a single PDF and generate download link
  const addWatermarkToPDF = async () => {
    if (!selectedFile || !watermarkText) return;

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(selectedFile);

    fileReader.onload = async () => {
      const pdfBytes = fileReader.result;
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Add watermark to each page
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        let watermarkYPosition = page.getHeight() - 200; // Start Y position for watermark
        
        // Draw the watermark text
        page.drawText(watermarkText, {
          x: 200,
          y: watermarkYPosition,
          size: 50,
          color: rgb(0.75, 0.75, 0.75),  // Use rgb from pdf-lib
          opacity: 0.5,
          rotate: degrees(-45), // Use degrees from pdf-lib
        });

        // Adjust the Y position for next watermark (so it doesn't collide)
        watermarkYPosition -= 100; // Move down 100 units for the next watermark
      });

      // Save the PDF with watermark
      const pdfWithWatermark = await pdfDoc.save();
      const blob = new Blob([pdfWithWatermark], { type: "application/pdf" });

      // Create a download link
      const downloadUrl = URL.createObjectURL(blob);
      setDownloadLink({ fileName: selectedFile.name, url: downloadUrl });

      // Trigger the download immediately
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = selectedFile.name;
      link.click(); // Simulate a click to trigger download

      // Clear selected file after watermarking
      setSelectedFile(null);
    };
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null); // Clear the selected file
  };

  return (
    <div className="add-watermark-container">
      <h1>Add Watermark Tool</h1>
      <p>Easily add watermarks to your PDF files.</p>

      {/* Text input for watermark */}
      <div className="watermark-input">
        <label htmlFor="watermarkText">Enter Watermark Text:</label>
        <input
          type="text"
          id="watermarkText"
          value={watermarkText}
          onChange={handleWatermarkTextChange}
          placeholder="Enter watermark text"
        />
      </div>

      {/* Drag-and-Drop Area */}
      <div
        className="dropbox"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag and drop your PDF file here</p>
        <p>or</p>
        <label className="file-upload-button">
          Select File
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            hidden
          />
        </label>
      </div>

      {/* Display Selected File */}
      {selectedFile && (
        <div className="file-list">
          <h3>Selected File:</h3>
          <ul>
            <li>
              {selectedFile.name}{" "}
              {watermarkText && (
                <span className="watermark-text"> - {watermarkText}</span>
              )}
            </li>
          </ul>
          {/* Remove Button */}
          <button onClick={removeSelectedFile}>Remove Selected File</button>
        </div>
      )}

      {/* Button to add watermark and generate download link */}
      <button onClick={addWatermarkToPDF} disabled={!watermarkText || !selectedFile}>
        Add Watermark and Download
      </button>

      {/* Display download link */}
      {downloadLink && (
        <div className="download-link">
          <h3>Download Watermarked PDF:</h3>
          <a href={downloadLink.url} download={downloadLink.fileName}>
            {downloadLink.fileName}
          </a>
        </div>
      )}
    </div>
  );
};

export default AddWatermark;
