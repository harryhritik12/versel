import sys
from docx import Document
import pdfplumber

def convert_pdf_to_doc(pdf_path, doc_path):
    document = Document()
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                document.add_paragraph(text)
    document.save(doc_path)

if __name__ == "__main__":
    pdf_path = sys.argv[1]  # First argument: PDF file path
    doc_path = sys.argv[2]  # Second argument: Output Word file path
    convert_pdf_to_doc(pdf_path, doc_path)
