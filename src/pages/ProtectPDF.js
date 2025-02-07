import React, { useState } from "react";
import axios from "axios";

const ProtectPDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [password, setPassword] = useState("");

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Send PDF and password to the server for protection
  const protectPDF = async () => {
    if (!pdfFile || !password) {
      alert("Please upload a PDF and enter a password.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("password", password);

    try {
      const response = await axios.post("https://docker-lv55.onrender.com/protect-pdf", formData, {
        responseType: "blob", // To handle binary file response
      });

      // Create a Blob URL for the protected PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `protected_${pdfFile.name}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error protecting PDF:", error);
      alert("An error occurred while protecting the PDF.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Protect PDF with Password</h2>
      <div
        style={{
          border: "2px dashed #ccc",
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        <p style={{ margin: 0 }}>
          Drag and drop your PDF here, or{" "}
          <label
            htmlFor="fileInput"
            style={{
              color: "#007BFF",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            browse
          </label>{" "}
          to upload.
        </p>
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        {pdfFile && (
          <p style={{ marginTop: "10px", color: "#4caf50" }}>
            Uploaded File: {pdfFile.name}
          </p>
        )}
      </div>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={protectPDF}
        style={{
          backgroundColor: "#007BFF",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Protect and Download PDF
      </button>
    </div>
  );
};

export default ProtectPDF;
