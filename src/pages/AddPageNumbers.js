import React, { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib"; // Import rgb from pdf-lib
import "../styles/pages.css"; // For component-specific styles

const AddPageNumbers = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleAddPageNumbers = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select PDF files to add page numbers.");
      return;
    }

    const updatedFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // Embed the standard font (Helvetica)
        const font = await pdfDoc.embedStandardFont("Helvetica");

        const pages = pdfDoc.getPages();
        pages.forEach((page, index) => {
          const { width } = page.getSize(); // Remove height since it's unused

          // Add page number at the bottom center of each page
          page.drawText(`Page ${index + 1}`, {
            x: width / 2 - 20, // Position text at the center
            y: 30, // Distance from the bottom
            size: 12,
            font: font, // Use the embedded Helvetica font
            color: rgb(0, 0, 0), // Use rgb to define color
          });
        });

        const pdfBytes = await pdfDoc.save();
        return new File([pdfBytes], `with-page-numbers-${file.name}`, {
          type: "application/pdf",
        });
      })
    );

    // Trigger the download of each updated file
    updatedFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    alert("Page numbers added successfully!");
  };

  return (
    <div className="add-page-numbers-container">
      <h1>Add Page Numbers Tool</h1>
      <p>Easily add page numbers to your PDF files.</p>

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
                <button onClick={() => removeFile(index)} className="remove-file-button">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Button to Add Page Numbers */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleAddPageNumbers}
          className="add-page-number-button"
        >
          Add Page Numbers
        </button>
      </div>
    </div>
  );
};

export default AddPageNumbers;
