import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { PDFDocument } from "pdf-lib"; // Import pdf-lib
import "../styles/pages.css";

const ConvertOrganizePDF = () => {
  const location = useLocation();
  const file = location.state?.file || null;
  const [pageOrder, setPageOrder] = useState("");
  const [organizedPDF, setOrganizedPDF] = useState(null); // State to store the organized PDF bytes
  const [isReorganized, setIsReorganized] = useState(false); // Track if the PDF is reorganized

  const handleOrganize = async () => {
    if (!pageOrder) {
      alert("Please specify the new page order.");
      return;
    }

    if (!file) {
      alert("No file uploaded.");
      return;
    }

    try {
      const pdfBytes = await file.arrayBuffer(); // Read the file as bytes
      const pdfDoc = await PDFDocument.load(pdfBytes); // Load the PDF document
      const totalPages = pdfDoc.getPageCount(); // Get the total number of pages

      console.log(`Total pages in document: ${totalPages}`);
      console.log(`User input page order: ${pageOrder}`);

      // Parse the page order input (e.g., "3,1,2,5-7")
      const parsedOrder = parsePageOrder(pageOrder, totalPages);
      console.log(`Parsed page order: ${parsedOrder}`);

      if (!parsedOrder) {
        alert("Invalid page order format.");
        return;
      }

      // Reorder the pages based on the parsed order
      const newPdf = await reorderPages(pdfDoc, parsedOrder, totalPages);

      // Generate the organized PDF
      const organizedPdfBytes = await newPdf.save();
      setOrganizedPDF(organizedPdfBytes);

      setIsReorganized(true); // Set to true after successful reorganization

      alert(`PDF pages have been reorganized successfully! Click 'Download' to get the new PDF.`);
    } catch (error) {
      console.error("Error organizing PDF:", error);
      alert("An error occurred while reorganizing the PDF.");
    }
  };

  const parsePageOrder = (orderString, totalPages) => {
    const pageOrder = [];
    const pageParts = orderString.split(",");

    pageParts.forEach((part) => {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        if (start >= 1 && end <= totalPages && start <= end) {
          for (let i = start; i <= end; i++) {
            pageOrder.push(i - 1); // Convert to zero-indexed
          }
        } else {
          console.log(`Invalid page range: ${part}`);
        }
      } else {
        const pageNum = Number(part);
        if (pageNum >= 1 && pageNum <= totalPages) {
          pageOrder.push(pageNum - 1); // Convert to zero-indexed
        } else {
          console.log(`Invalid page number: ${part}`);
        }
      }
    });

    // Remove duplicates and ensure order
    return [...new Set(pageOrder)];
  };

  const reorderPages = async (pdfDoc, newOrder, totalPages) => {
    const newPdf = await PDFDocument.create();

    // First, copy the pages in the specified order
    const pages = await newPdf.copyPages(pdfDoc, newOrder);

    // Handle the case where a single page is requested and append all other pages at the end
    const allPages = Array.from({ length: totalPages }, (_, i) => i); // Create an array of all page indexes
    const remainingPages = allPages.filter(page => !newOrder.includes(page));

    console.log(`Reordered pages: ${newOrder}`);
    console.log(`Remaining pages to be added: ${remainingPages}`);

    // Add the requested pages first
    pages.forEach((page) => {
      newPdf.addPage(page);
    });

    // Add the remaining pages in order, copying them to avoid "foreign page" error
    const remainingPagesCopy = await newPdf.copyPages(pdfDoc, remainingPages);  // Copy remaining pages correctly
    remainingPagesCopy.forEach((page) => {
      newPdf.addPage(page);
    });

    return newPdf;
  };

  const handleDownload = () => {
    if (!organizedPDF) {
      alert("No organized PDF to download.");
      return;
    }

    const blob = new Blob([organizedPDF], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `organized_${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="convert-organize-pdf-container">
      <h1>Organize PDF Options</h1>
      {file ? (
        <>
          <p>File to modify: {file.name}</p>
          <div className="organize-options">
            <label htmlFor="page-order">
              Enter new page order (e.g., "3,1,2,5-7"):
            </label>
            <input
              type="text"
              id="page-order"
              value={pageOrder}
              onChange={(e) => setPageOrder(e.target.value)}
              placeholder="3,1,2,5-7"
            />
          </div>
          <div className="action-buttons">
            {isReorganized ? (
              <button className="download-button" onClick={handleDownload}>
                Download Organized PDF
              </button>
            ) : (
              <button className="convert-button" onClick={handleOrganize}>
                Organize PDF
              </button>
            )}
          </div>
        </>
      ) : (
        <p>No file uploaded.</p>
      )}
    </div>
  );
};

export default ConvertOrganizePDF;
