import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import "../styles/pages.css";

const ConvertPDF = () => {
  const location = useLocation();
  const selectedFiles = location.state?.files || [];
  const [pdfBlob, setPdfBlob] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Generate image previews when files are selected
  useEffect(() => {
    const generatePreviews = async () => {
      const previews = await Promise.all(
        selectedFiles.map((file) => readFileAsDataURL(file))
      );
      setImagePreviews(previews);
    };

    if (selectedFiles.length > 0) {
      generatePreviews();
    }
  }, [selectedFiles.length]); // Only rerun if the number of selected files changes

  // Handle image to PDF conversion
  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert("No files selected for conversion.");
      return;
    }

    const pdfDoc = new jsPDF();

    for (const [index, file] of selectedFiles.entries()) {
      const imgData = await readFileAsDataURL(file);

      const img = new Image();
      img.src = imgData;

      await new Promise((resolve) => {
        img.onload = () => {
          const pageWidth = pdfDoc.internal.pageSize.getWidth();
          const pageHeight = pdfDoc.internal.pageSize.getHeight();
          const imgWidth = img.width;
          const imgHeight = img.height;

          // Scale image to fit within the page while maintaining aspect ratio
          const scaleFactor = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
          const scaledWidth = imgWidth * scaleFactor;
          const scaledHeight = imgHeight * scaleFactor;

          // Center the image on the page
          const xOffset = (pageWidth - scaledWidth) / 2;
          const yOffset = (pageHeight - scaledHeight) / 2;

          // Add image to the PDF
          pdfDoc.addImage(imgData, "JPEG", xOffset, yOffset, scaledWidth, scaledHeight);

          // Add file name as text below the image
          pdfDoc.setFontSize(12);
          pdfDoc.text(file.name, 10, yOffset + scaledHeight + 10); // Adjust positioning for the text

          // Add new page for the next image, except after the last one
          if (index < selectedFiles.length - 1) {
            pdfDoc.addPage();
          }

          resolve();
        };
      });
    }

    const pdfOutput = pdfDoc.output("blob");
    setPdfBlob(pdfOutput);

    alert("Conversion to PDF completed. You can now download your PDF.");
  };

  // Handle PDF download
  const handleDownload = () => {
    if (!pdfBlob) {
      alert("No PDF generated. Please convert the files first.");
      return;
    }

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert file to data URL
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="convert-pdf-container">
      <h1>Convert Images to PDF</h1>
      <p>Files ready for conversion:</p>
      {selectedFiles.length > 0 ? (
        <ul>
          {selectedFiles.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      ) : (
        <p>No files selected. Please go back and upload files.</p>
      )}

      {/* Display image previews */}
      {imagePreviews.length > 0 && (
        <div className="image-previews">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="image-preview-container">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="image-preview"
              />
              <p className="image-name">{selectedFiles[index].name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="action-buttons">
        <button
          className="convert-button"
          onClick={handleConvert}
          disabled={selectedFiles.length === 0}
        >
          Convert to PDF
        </button>
        <button
          className="download-button"
          onClick={handleDownload}
          disabled={!pdfBlob}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ConvertPDF;
