import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "../styles/pages.css";

const ConvertHTMLToPDF = () => {
  const location = useLocation();
  const selectedFiles = location.state?.files || [];
  const [pdfUrl, setPdfUrl] = useState(null);
  const [converted, setConverted] = useState(false); // Track if conversion is done

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert("No files selected for conversion.");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const htmlContent = e.target.result;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, { scale: 3 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        let heightLeft = canvas.height - imgHeight;
        let position = imgHeight;

        while (heightLeft > 0) {
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight);
          position += imgHeight;
          heightLeft -= pdf.internal.pageSize.getHeight();
        }

        const pdfBlob = pdf.output("blob");
        setPdfUrl(URL.createObjectURL(pdfBlob));
        setConverted(true); // Mark conversion as done

        document.body.removeChild(tempDiv);
      };

      reader.readAsText(selectedFiles[0]); // Process only the first file
    } catch (error) {
      console.error("Error converting HTML to PDF:", error);
      alert("Failed to convert HTML to PDF.");
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      alert("Please convert the file before downloading.");
      return;
    }

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "converted.pdf";
    link.click();
  };

  return (
    <div className="convert-html-to-pdf-container">
      <h1>Convert HTML to PDF</h1>
      <p>Files ready for conversion:</p>
      {selectedFiles.length > 0 ? (
        <ul>
          {selectedFiles.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      ) : (
        <p>No files selected.</p>
      )}
      <div className="action-buttons">
        {!converted && ( // Hide Convert button after conversion
          <button className="convert-button" onClick={handleConvert}>
            Convert to PDF
          </button>
        )}
        {pdfUrl && ( // Show Download button only if PDF is available
          <button className="download-button" onClick={handleDownload}>
            Download PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default ConvertHTMLToPDF;
