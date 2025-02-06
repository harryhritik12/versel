import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import "../styles/pages.css";

const ConvertScanToPDF = () => {
  const location = useLocation();
  const files = location.state?.files || [];
  const [fileOrder, setFileOrder] = useState(
    files.map((file, index) => ({ id: index, name: file.name, file }))
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleReorder = (e, index) => {
    const newPosition = parseInt(e.target.value, 10) - 1;
    if (newPosition < 0 || newPosition >= fileOrder.length || isNaN(newPosition)) {
      setError("Invalid position. Please enter a valid number.");
      return;
    }
    setError("");

    const updatedOrder = [...fileOrder];
    const [reorderedItem] = updatedOrder.splice(index, 1);
    updatedOrder.splice(newPosition, 0, reorderedItem);
    setFileOrder(updatedOrder);
  };

  const handleGeneratePDF = async () => {
    if (fileOrder.length === 0) {
      setError("No files available to generate a PDF.");
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();

      for (const { file } of fileOrder) {
        const arrayBuffer = await file.arrayBuffer();
        const sourcePDF = await PDFDocument.load(arrayBuffer);
        const copiedPages = await pdfDoc.copyPages(sourcePDF, sourcePDF.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setMessage("PDF successfully generated!");
      return url; // Return the URL to allow download
    } catch (err) {
      setError("Failed to generate PDF. Please try again.");
    }
  };

  const handleDownload = async () => {
    const pdfUrl = await handleGeneratePDF();
    if (!pdfUrl) return;

    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "combined.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(pdfUrl);
    setMessage("PDF downloaded successfully.");
  };

  return (
    <div className="convert-scan-to-pdf-container">
      <h1>Generate PDF from Scans</h1>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {files.length > 0 ? (
        <>
          <p>Uploaded files:</p>
          <ul>
            {fileOrder.map((file, index) => (
              <li key={file.id} className="file-item">
                {file.name} - Reorder to position:
                <input
                  type="number"
                  min="1"
                  max={fileOrder.length}
                  value={index + 1}
                  onChange={(e) => handleReorder(e, index)}
                />
              </li>
            ))}
          </ul>
          <div className="action-buttons">
            <button className="convert-button" onClick={handleDownload}>
              Download PDF
            </button>
          </div>
        </>
      ) : (
        <p>No files uploaded.</p>
      )}
    </div>
  );
};

export default ConvertScanToPDF;
