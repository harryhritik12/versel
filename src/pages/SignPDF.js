import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

const SignPDF = () => {
  const [pdf, setPdf] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [signatureText, setSignatureText] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to load PDF from selected file
  const loadPDF = async (file) => {
    if (!file) return;
    try {
      setLoading(true);
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      setPdf(pdfDoc);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Failed to load PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdfFile(file);
      loadPDF(file);
    }
  };

  // Handle text input change
  const handleTextChange = (event) => {
    setSignatureText(event.target.value);
  };

  // Function to sign the PDF on all pages
  const signPDF = async () => {
    if (!pdf || !signatureText) return;

    try {
      setLoading(true);
      const pages = pdf.getPages();
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(signatureText, 30);
        const xPosition = (width - textWidth) / 2;
        const yPosition = 40; // Adjust position for signature

        page.drawText(signatureText, {
          x: xPosition,
          y: yPosition,
          size: 30,
          font,
          color: rgb(0, 0, 0),
        });
      });

      // Save and download the modified PDF
      const pdfBytes = await pdf.save();
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(pdfBlob, "signed-document.pdf");

      alert(`PDF signed successfully on ${pages.length} pages!`);
    } catch (error) {
      console.error("Error signing PDF:", error);
      alert("Failed to sign PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Sign PDF Document</h2>

      {/* File Input */}
      <input type="file" onChange={handleFileChange} accept="application/pdf" />

      {/* Signature Text Input */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={signatureText}
          onChange={handleTextChange}
          placeholder="Enter your signature"
          disabled={!pdf}
          style={{ padding: "5px", width: "250px" }}
        />
      </div>

      {/* Buttons */}
      <div style={{ marginTop: "15px" }}>
        <button onClick={() => loadPDF(pdfFile)} disabled={!pdfFile || loading}>
          {loading ? "Loading..." : "Reload PDF"}
        </button>
        <button onClick={signPDF} disabled={!pdf || !signatureText || loading} style={{ marginLeft: "10px" }}>
          {loading ? "Signing..." : "Sign PDF"}
        </button>
      </div>
    </div>
  );
};

export default SignPDF;
