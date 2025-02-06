import React, { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib"; // Import pdf-lib
import "../styles/pages.css";

const ConvertRemovePages = () => {
  const [pdfDoc, setPdfDoc] = useState(null); // Store the PDF document
  const [pdfUrl, setPdfUrl] = useState(null); // URL for the modified PDF
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState([]); // Store the list of page numbers
  const [selectedPages, setSelectedPages] = useState(new Set()); // Track selected pages
  const [showPages, setShowPages] = useState(false); // Toggle for showing pages list
  const [currentPage, setCurrentPage] = useState(1); // Track the current page of page numbers
  const pageSize = 20; // Number of pages to show per page

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFileName(uploadedFile.name);
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPdfDoc(pdfDoc);

      // Get number of pages in the PDF and generate the list of page numbers
      const totalPages = pdfDoc.getPageCount();
      setPages([...Array(totalPages).keys()].map((i) => i + 1)); // Page numbers starting from 1

      // Create a preview URL for the uploaded PDF
      const previewUrl = URL.createObjectURL(uploadedFile);
      setPdfUrl(previewUrl);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handlePageSelection = (pageNumber) => {
    setSelectedPages((prevSelectedPages) => {
      const newSelectedPages = new Set(prevSelectedPages);
      if (newSelectedPages.has(pageNumber)) {
        newSelectedPages.delete(pageNumber); // Deselect page
      } else {
        newSelectedPages.add(pageNumber); // Select page
      }
      return newSelectedPages;
    });
  };

  const handleRemovePages = async () => {
    if (!pdfDoc || selectedPages.size === 0) {
      alert("Please select pages to remove.");
      return;
    }

    // Convert selected pages to an array
    const pagesToRemove = Array.from(selectedPages).map((pageNum) => pageNum - 1); // Convert to 0-based index

    // Remove selected pages
    pagesToRemove.forEach((pageIndex) => {
      pdfDoc.removePage(pageIndex);
    });

    const updatedPdfBytes = await pdfDoc.save();
    const updatedPdfBlob = new Blob([updatedPdfBytes], { type: "application/pdf" });
    const updatedPdfUrl = URL.createObjectURL(updatedPdfBlob);
    setPdfUrl(updatedPdfUrl);
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      alert("No updated PDF to download.");
      return;
    }
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `modified-${fileName}`;
    link.click();
  };

  // Calculate the pages to display for the current page
  const displayedPages = pages.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="convert-remove-pages-container">
      <h1>Remove Pages Options</h1>
      <div>
        <input
          type="file"
          onChange={handleFileUpload}
          accept="application/pdf"
        />
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="500px"
            title="PDF Preview"
          ></iframe>
        )}
      </div>

      {pdfDoc && (
        <>
          <div className="action-buttons">
            <button
              className="show-pages-button"
              onClick={() => setShowPages(!showPages)}
            >
              {showPages ? "Hide Pages" : "Show Pages"}
            </button>
          </div>

          {showPages && (
            <>
              <div className="page-selection">
                <h3>Select pages to remove:</h3>
                <ul>
                  {displayedPages.map((pageNum) => (
                    <li key={pageNum}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedPages.has(pageNum)}
                          onChange={() => handlePageSelection(pageNum)}
                        />
                        Page {pageNum}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pagination-buttons">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(pages.length / pageSize)))}
                  disabled={currentPage === Math.ceil(pages.length / pageSize)}
                >
                  Next
                </button>
              </div>
            </>
          )}

          <div className="action-buttons">
            <button className="convert-button" onClick={handleRemovePages}>
              Remove Selected Pages
            </button>
            <button className="download-button" onClick={handleDownload}>
              Download Updated PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ConvertRemovePages;
