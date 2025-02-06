import fitz

def convert_to_pdfa(input_pdf, output_pdf):
    doc = fitz.open(input_pdf)
    doc.save(output_pdf, deflate=True)
    print("PDF converted successfully!")

# Example usage
convert_to_pdfa("input.pdf", "output.pdfa.pdf")
