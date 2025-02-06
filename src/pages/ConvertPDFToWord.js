import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/pages.css";

const ConvertPDFToWord = () => {
    const location = useLocation(); // Get the passed state from `navigate`
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isConverting, setIsConverting] = useState(false);
    const [convertedFiles, setConvertedFiles] = useState([]);

    useEffect(() => {
        // Retrieve files from location state (if available)
        if (location.state?.files) {
            setSelectedFiles(location.state.files);
        }
    }, [location.state]);

    const handleConvert = async () => {
        if (selectedFiles.length === 0) {
            alert("No files provided for conversion.");
            return;
        }

        setIsConverting(true);

        try {
            const formData = new FormData();
            formData.append("file", selectedFiles[0]); // Handle the first file for simplicity

            const response = await axios.post("https://versel-rxs2.onrender.com/convert-pdf-to-word", formData, {
                responseType: "blob", // Receive the file as a Blob
            });

            const fileURL = window.URL.createObjectURL(new Blob([response.data]));
            setConvertedFiles([{ name: selectedFiles[0].name.replace(".pdf", ".docx"), url: fileURL }]);

            alert("Conversion successful! You can now download the Word document.");
        } catch (error) {
            console.error("Error during conversion:", error);
            alert("An error occurred while converting the file.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = (convertedFile) => {
        const link = document.createElement("a");
        link.href = convertedFile.url;
        link.setAttribute("download", convertedFile.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="convert-pdf-to-word-container">
            <h1>Convert PDF to Word</h1>

            {selectedFiles.length > 0 ? (
                <div>
                    <p>Files ready for conversion:</p>
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No files provided for conversion. Please go back and select a file.</p>
            )}

            <div className="action-buttons">
                <button onClick={handleConvert} disabled={isConverting || selectedFiles.length === 0}>
                    {isConverting ? "Converting..." : "Convert to Word"}
                </button>

                {convertedFiles.length > 0 && (
                    <button onClick={() => handleDownload(convertedFiles[0])}>
                        Download Word
                    </button>
                )}
            </div>
        </div>
    );
};

export default ConvertPDFToWord;
