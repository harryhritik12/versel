import React, { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";

const RotatePDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(90);  // Set the default rotation angle to 90

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle the rotation of the entire PDF
  const handleRotate = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file.");
      return;
    }

    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Rotate each page individually
    pdfDoc.getPages().forEach((page) => {
      // Apply the rotation angle to each page
      page.setRotation(degrees(rotationAngle));
    });

    // Save the rotated PDF as bytes
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    // Create a downloadable link for the rotated PDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rotated-${selectedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("PDF rotated successfully!");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Rotate PDF Tool</h1>
      <p>Upload a PDF, set the rotation angle, and download the rotated PDF.</p>

      {/* File input to upload a PDF */}
      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {/* Rotation angle selector */}
      <div style={{ marginTop: "20px" }}>
        <label htmlFor="rotation-angle">Rotation Angle:</label>
        <select
          id="rotation-angle"
          value={rotationAngle}
          onChange={(e) => setRotationAngle(parseInt(e.target.value))}
        >
          <option value={90}>90°</option>
          <option value={180}>180°</option>
          <option value={270}>270°</option>
        </select>
      </div>

      {/* Button to trigger the rotation and download */}
      <button
        onClick={handleRotate}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Rotate and Download
      </button>
    </div>
  );
};

export default RotatePDF;
