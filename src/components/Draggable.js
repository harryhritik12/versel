import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import DrawArea from "./DrawArea";
import { Map as ImmutableMap } from 'immutable'; // Import Immutable for freehand drawing

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function EditPDF(props) {
  // PDF viewing states
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Handle document load success
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  // Notify parent component of page change
  useEffect(() => {
    props.pageChange(pageNumber);
  }, [pageNumber]);

  // Change page
  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  // Handle PDF modification when download button is clicked
  useEffect(() => {
    if (props.buttonType === "download") {
      modifyPdf();
      props.resetButtonType();
    }
  }, [props.buttonType]);

  // Modify PDF and trigger download
  async function modifyPdf() {
    try {
      // Fetch the existing PDF
      const existingPdfBytes = await fetch(props.pdf).then((res) => res.arrayBuffer());

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const textSize = 16;

      // Iterate through the results (annotations) and add them to the PDF
      props.result.forEach((res) => {
        if (res.type === "text") {
          // Draw text annotations
          pages[res.page - 1].drawText(res.text, {
            x: res.ref.current.offsetLeft - props.bounds.x,
            y: props.bounds.y - res.ref.current.offsetTop - 17,
            size: textSize,
            font: helveticaFont,
            color: rgb(0.95, 0.1, 0.1),
            maxWidth: res.ref.current.getBoundingClientRect().width,
            lineHeight: 15,
          });
        }
        if (res.type === "freehand") {
          // Draw freehand annotations
          const pathData =
            "M " +
            res.arr
              .map((p) => {
                return `${p.get('x')},${p.get('y')}`;
              })
              .join(" L ");
          pages[res.page - 1].moveTo(0, pages[0].getHeight());
          pages[res.page - 1].drawSvgPath(pathData, {
            borderColor: rgb(0.95, 0.1, 0.1),
          });
        }
      });

      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();

      // Trigger download
      let blob = new Blob([pdfBytes], { type: "application/pdf" });
      let link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "modified.pdf";
      link.click();
    } catch (error) {
      console.error("Error modifying PDF:", error);
    }
  }

  return (
    <>
      <div>
        {/* PDF Document Viewer */}
        <Document
          file={props.pdf}
          options={{ workerSrc: "/pdf.worker.js" }}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={console.error}
        >
          {/* DrawArea for annotations */}
          <DrawArea
            getPaths={props.getPaths}
            page={pageNumber}
            flag={props.flag}
            getBounds={props.getBounds}
            changeFlag={props.changeFlag}
            cursor={props.cursor}
            buttonType={props.buttonType}
            resetButtonType={props.resetButtonType}
          >
            <Page pageNumber={pageNumber} />
          </DrawArea>
        </Document>
      </div>

      {/* Page Navigation */}
      <div>
        <p>
          Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
        </p>
        <button type="button" disabled={pageNumber <= 1} onClick={previousPage}>
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-arrow-left"></i>
        </button>
        <button type="button" disabled={pageNumber >= numPages} onClick={nextPage}>
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-arrow-right"></i>
        </button>
      </div>
    </>
  );
}