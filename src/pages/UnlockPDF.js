import React, { useState } from "react";
import axios from "axios";

const UnlockPDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [password, setPassword] = useState("");

  // Handle PDF file input
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Handle password input
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  // Function to unlock the PDF
  const unlockPDF = async () => {
    if (!pdfFile || !password) {
      alert("Please upload a PDF and enter a password.");
      return;
    }

    // Create FormData to send the file and password
    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("password", password);

    try {
      // Send the PDF and password to the backend to unlock it
      const response = await axios.post("https://versel-rxs2.onrender.com/unlock-pdf", formData, {
        responseType: "blob",
      });

      // Create a download link for the unlocked PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `unlocked_${pdfFile.name}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error unlocking the PDF:", error);
      alert("Error unlocking the PDF. Please check the password and try again.");
    }
  };

  return (
    <div>
      <h1>Unlock PDF Tool</h1>
      <p>This is the page where you can unlock password-protected PDF files.</p>

      <div>
        <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      </div>

      <div>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={handlePasswordChange}
        />
      </div>

      <button onClick={unlockPDF}>Unlock PDF</button>
    </div>
  );
};

export default UnlockPDF;
