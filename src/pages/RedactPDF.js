import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function RedactPDF() {
    const [file, setFile] = useState(null);
    const [wordsToRedact, setWordsToRedact] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [previewPdfUrl, setPreviewPdfUrl] = useState(''); // For previewing the uploaded PDF

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        if (selectedFile) {
            const fileUrl = URL.createObjectURL(selectedFile);
            setPreviewPdfUrl(fileUrl); // Update preview PDF URL
        }
    };

    const extractTextPositions = async (pdfFile) => {
        const pdfData = await pdfFile.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const pages = [];

        for (let i = 0; i < pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i + 1);
            const textContent = await page.getTextContent();
            const words = [];

            textContent.items.forEach((item) => {
                const individualWords = item.str.split(/\s+/);
                let offsetX = 0;

                individualWords.forEach((word) => {
                    const wordWidth = (item.width / item.str.length) * word.length;
                    words.push({
                        text: word,
                        x: item.transform[4] + offsetX,
                        y: item.transform[5],
                        width: wordWidth,
                        height: item.height,
                    });
                    offsetX += wordWidth;
                });
            });

            pages.push(words);
        }

        return pages;
    };

    const redactPdf = async (pdfBytes, wordsToRedact, textPositions) => {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        const redactWords = wordsToRedact
            .split(',')
            .map((word) => word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|');
        const redactRegex = new RegExp(`\\b(${redactWords})\\b`, 'i');

        const TOLERANCE = 2;

        pages.forEach((page, pageIndex) => {
            const pageTextPositions = textPositions[pageIndex];

            pageTextPositions.forEach((item) => {
                if (redactRegex.test(item.text)) {
                    page.drawRectangle({
                        x: item.x - TOLERANCE,
                        y: item.y - TOLERANCE,
                        width: item.width + TOLERANCE * 2,
                        height: item.height + TOLERANCE * 2,
                        color: rgb(0, 0, 0),
                    });
                }
            });
        });

        return pdfDoc.save();
    };

    const handleRedactSubmit = async () => {
        if (!file || !wordsToRedact.trim()) {
            alert('Please upload a PDF and enter words to redact.');
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = async () => {
            const pdfBytes = new Uint8Array(fileReader.result);
            const textPositions = await extractTextPositions(file);

            try {
                const redactedPdfBytes = await redactPdf(pdfBytes, wordsToRedact, textPositions);
                const redactedPdfUrl = URL.createObjectURL(
                    new Blob([redactedPdfBytes], { type: 'application/pdf' })
                );
                setPdfUrl(redactedPdfUrl);
            } catch (error) {
                console.error('Error redacting PDF:', error);
                alert('An error occurred while redacting the PDF.');
            }
        };

        fileReader.readAsArrayBuffer(file);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>PDF Redactor</h1>
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
                <input
                    type="text"
                    placeholder="Enter words or sentences to redact (comma-separated)"
                    value={wordsToRedact}
                    onChange={(e) => setWordsToRedact(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '10px',
                        fontSize: '16px',
                    }}
                />
                <button
                    onClick={handleRedactSubmit}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#007BFF',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Redact PDF
                </button>
            </div>

            {pdfUrl && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Redacted PDF:</h2>
                    <iframe
                        src={pdfUrl}
                        width="100%"
                        height="600px"
                        style={{ border: '1px solid #CCC', marginBottom: '20px' }}
                    ></iframe>
                    <a
                        href={pdfUrl}
                        download="redacted.pdf"
                        style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            fontSize: '16px',
                            backgroundColor: '#28A745',
                            color: '#FFF',
                            textDecoration: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Download Redacted PDF
                    </a>
                </div>
            )}
        </div>
    );
}

export default RedactPDF;
