import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { saveAs } from "file-saver";
import "../styles/pages.css";

// Set the workerSrc to the local path of pdf.worker.min.js
GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.entry");

const ConvertPDFToJPG = () => {
  const location = useLocation();
  const selectedFiles = location.state?.files || [];
  const [images, setImages] = useState([]);

  // Function to convert PDF to JPG
  const handleConvert = async () => {
    alert("Converting PDF files to JPG...");
    const pdfFiles = selectedFiles;
    const imageArray = [];

    for (const file of pdfFiles) {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const pdfData = new Uint8Array(e.target.result);
        const pdf = await getDocument(pdfData).promise;

        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          const imageUrl = canvas.toDataURL("image/jpeg");
          imageArray.push(imageUrl);
        }

        setImages(imageArray);
      };
      fileReader.readAsArrayBuffer(file);
    }
  };

  // Function to download JPG images
  const handleDownload = () => {
    alert("Downloading JPG files...");
    images.forEach((image, index) => {
      const imageBlob = dataURLtoBlob(image);
      saveAs(imageBlob, `converted-image-${index + 1}.jpg`);
    });
  };

  // Helper function to convert a data URL to a Blob
  const dataURLtoBlob = (dataURL) => {
    const [metadata, base64Data] = dataURL.split(",");
    const mime = metadata.match(/:(.*?);/)[1];
    const binaryData = atob(base64Data);
    const length = binaryData.length;
    const buffer = new ArrayBuffer(length);
    const view = new Uint8Array(buffer);

    for (let i = 0; i < length; i++) {
      view[i] = binaryData.charCodeAt(i);
    }

    return new Blob([buffer], { type: mime });
  };

  return (
    <div className="convert-pdf-to-jpg-container">
      <h1>Convert PDF to JPG</h1>
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

      {/* Image preview section */}
      <div className="image-preview-container">
        {images.length > 0 ? (
          images.map((image, index) => (
            <div key={index}>
              <img
                src={image}
                alt={`Converted Page ${index + 1}`}
                className="image-preview"
              />
              <p className="image-name">Converted Image {index + 1}</p>
            </div>
          ))
        ) : null}
      </div>

      <div className="action-buttons">
        <button className="convert-button" onClick={handleConvert}>
          Convert to JPG
        </button>
        <button className="download-button" onClick={handleDownload}>
          Download JPG
        </button>
      </div>
    </div>
  );
};

export default ConvertPDFToJPG;
