import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function EditPDF() {
    const [file, setFile] = useState(null);
    const [previewPdfUrl, setPreviewPdfUrl] = useState(''); // For previewing the uploaded PDF

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        if (selectedFile) {
            const fileUrl = URL.createObjectURL(selectedFile);
            setPreviewPdfUrl(fileUrl); // Update preview PDF URL
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>PDF Editor</h1>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{ marginBottom: '10px', display: 'block' }}
                />
                {previewPdfUrl && (
                    <div style={{ marginTop: '20px' }}>
                        <h2>Uploaded PDF:</h2>
                        <iframe
                            src={previewPdfUrl}
                            width="100%"
                            height="600px"
                            style={{ border: '1px solid #CCC' }}
                        ></iframe>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EditPDF;