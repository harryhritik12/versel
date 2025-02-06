import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import "../styles/pages.css";

// Enhanced preprocessing function
const preprocessImage = (imgData) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imgData;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Convert to grayscale, enhance contrast, and apply adaptive thresholding
      ctx.filter = "grayscale(100%) contrast(180%) brightness(120%)";
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Apply adaptive thresholding for better binarization
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const binarized = avg > 128 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = binarized;
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL());
    };
  });
};

// Function to extract text from PDF
const extractTextFromPDF = async (pdfData) => {
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item) => item.str).join(" ");
    fullText += text + "\n";
  }

  return fullText;
};

const ConvertOCRPDF = () => {
  const location = useLocation();
  const files = location.state?.files || [];
  const [language, setLanguage] = useState("eng");
  const [isProcessing, setIsProcessing] = useState(false); // Loading state

  const handleOCR = async () => {
    if (files.length === 0) {
      alert("Please upload files first.");
      return;
    }

    setIsProcessing(true); // Start processing
    alert(`Applying OCR with ${language} language support...`);

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          return new Promise(async (resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = async () => {
              const fileData = fileReader.result;
              console.log(`Processing file: ${file.name}`);

              try {
                let text = "";

                if (file.type === "application/pdf") {
                  text = await extractTextFromPDF(fileData);
                } else if (file.type.startsWith("image/")) {
                  const preprocessedImage = await preprocessImage(fileData);
                  const { data: { text: ocrText } } = await Tesseract.recognize(
                    preprocessedImage,
                    language,
                    {
                      logger: (m) => console.log(m),
                      oem: 3,
                      psm: 6,
                      tessedit_char_whitelist:
                        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.!?;:-()\"'",
                    }
                  );
                  text = ocrText;
                } else {
                  alert(`"${file.name}" is not a valid image or PDF format. Skipping.`);
                  resolve(null);
                  return;
                }

                resolve({ file, text });
              } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                reject(error);
              }
            };

            if (file.type === "application/pdf") {
              fileReader.readAsArrayBuffer(file);
            } else {
              fileReader.readAsDataURL(file);
            }
          });
        })
      );

      console.log("OCR Results:", results);

      // Generate and download text files after all files are processed
      results.forEach((result) => {
        if (result) {
          generateTextFile(result.file.name, result.text);
        }
      });

      alert("OCR processing complete. Files downloaded.");
    } catch (error) {
      console.error("Error during OCR processing:", error);
      alert("An error occurred during OCR processing.");
    } finally {
      setIsProcessing(false); // Stop processing
    }
  };

  const generateTextFile = (fileName, text) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.replace(/\.[^/.]+$/, "")}_ocr.txt`;
    link.click();
  };

  return (
    <div className="convert-ocr-pdf-container">
      <h1>OCR Options</h1>
      {files.length > 0 ? (
        <>
          <p>Uploaded files:</p>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <div className="ocr-options">
            <label htmlFor="language-select">Select OCR Language:</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="eng">English</option>
              <option value="spa">Spanish</option>
              <option value="fra">French</option>
              <option value="deu">German</option>
              <option value="chi_sim">Chinese</option>
            </select>
          </div>
          <div className="action-buttons">
            <button
              className="convert-button"
              onClick={handleOCR}
              disabled={isProcessing} // Disable button while processing
            >
              {isProcessing ? "Processing..." : "Apply OCR"}
            </button>
          </div>
        </>
      ) : (
        <p>No files uploaded.</p>
      )}
    </div>
  );
};

export default ConvertOCRPDF;