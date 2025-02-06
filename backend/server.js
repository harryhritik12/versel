const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const pdfParse = require("pdf-parse");
const pdf2table = require("pdf2table");
const ExcelJS = require("exceljs");
const cors = require("cors");
const { extractFile } = require("./extractor");

const app = express();
const PORT = 5000;

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Configure multer for file uploads
let upload = multer({ dest: "uploads/" });

// ==========================
// 📌 1️⃣ Compare Two PDFs
// ==========================
app.post("/compare", upload.array("pdfs", 2), async (req, res) => {
  if (!req.files || req.files.length !== 2) {
    return res.status(400).json({ success: false, message: "Please upload exactly two PDF files." });
  }

  try {
    const pdf1Text = (await pdfParse(fs.readFileSync(req.files[0].path))).text;
    const pdf2Text = (await pdfParse(fs.readFileSync(req.files[1].path))).text;

    const differences = comparePDFs(pdf1Text, pdf2Text);
    const areIdentical = differences.length === 0;

    fs.unlinkSync(req.files[0].path);
    fs.unlinkSync(req.files[1].path);

    res.json({ success: true, areIdentical, differences });
  } catch (error) {
    console.error("Error comparing PDFs:", error);
    res.status(500).json({ success: false, message: "Error comparing PDFs." });
  }
});

function comparePDFs(pdf1Text, pdf2Text) {
  const pdf1Lines = pdf1Text.split("\n");
  const pdf2Lines = pdf2Text.split("\n");
  const differences = [];

  for (let i = 0; i < Math.max(pdf1Lines.length, pdf2Lines.length); i++) {
    if (pdf1Lines[i] !== pdf2Lines[i]) {
      differences.push({
        line: i + 1,
        pdf1: pdf1Lines[i] || "(No content)",
        pdf2: pdf2Lines[i] || "(No content)",
      });
    }
  }
  return differences;
}

// ==========================
// 📌 2️⃣ Convert PDF to Excel
// ==========================
app.post("/convert-to-excel", upload.single("file"), async (req, res) => {
  if (!req.file || req.file.mimetype !== "application/pdf") {
    return res.status(400).send("Only PDF files are supported.");
  }

  const pdfPath = req.file.path;

  try {
    const pdfBuffer = fs.readFileSync(pdfPath);

    pdf2table.parse(pdfBuffer, (err, rows) => {
      if (err) {
        console.error("Error parsing PDF:", err);
        return res.status(500).send("Failed to convert PDF to Excel.");
      }

      const cleanedRows = rows
        .map((row) => row.filter((cell) => cell.trim() !== "")) // Remove empty cells
        .filter((row) => row.length > 1); // Remove incomplete rows

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");

      worksheet.addRow(["First Name", "Last Name", "Gender", "Country", "Age", "Date", "Id"]); // Fix header

      cleanedRows.forEach((row) => {
        if (row.length === 7) worksheet.addRow(row); // Ensure correct row length
      });

      workbook.xlsx.writeBuffer().then((buffer) => {
        res.set({
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="converted.xlsx"',
        });

        res.send(buffer);
        fs.unlinkSync(pdfPath);
      });
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).send("Failed to convert PDF to Excel.");
  }
});


// ==========================
// 📌 3️⃣ Convert `PPT/DOC/XLS` to PDF
// ==========================
const convertToPDF = (inputFile, outputDir) => {
  return new Promise((resolve, reject) => {
    const sofficePath = "C:\\Program Files\\LibreOffice\\program\\soffice.exe";
    const command = `"${sofficePath}" --headless --convert-to pdf --outdir "${outputDir}" --infilter="Calc:calc8" --print-to-file --printer-name --nologo --nolockcheck --invisible "${inputFile}"`;

    exec(command, (err, stdout, stderr) => {
      if (err || stderr) {
        reject(`Conversion failed: ${stderr || err.message}`);
      } else {
        const outputFileName = path.basename(inputFile, path.extname(inputFile)) + ".pdf";
        resolve(path.join(outputDir, outputFileName));
      }
    });
  });
};

app.post("/convert", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const allowedExtensions = [".ppt", ".pptx", ".doc", ".docx", ".xls", ".xlsx"];
  const inputFilePath = path.resolve(req.file.path);
  const outputDir = path.resolve(__dirname, "uploads");
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    fs.promises.unlink(inputFilePath).catch(console.error);
    return res.status(400).send("Unsupported file type.");
  }

  try {
    const convertedFilePath = await convertToPDF(inputFilePath, outputDir);
    res.download(convertedFilePath, () => {
      fs.promises.unlink(inputFilePath).catch(console.error);
      fs.promises.unlink(convertedFilePath).catch(console.error);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error converting file to PDF.");
  }
});

// ==========================
// 📌 4️⃣ Protect PDF with Password
// ==========================
app.post("/protect-pdf", upload.single("pdf"), (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).send("Password is required.");

  const uploadedFilePath = req.file.path;
  const outputFilePath = path.join("uploads", `protected_${req.file.originalname}`);

  exec(
    `qpdf "${uploadedFilePath}" --password=${password} --encrypt ${password} ${password} 256 -- "${outputFilePath}"`,
    (err) => {
      if (err) return res.status(500).send("Error adding password.");
      res.download(outputFilePath, () => {
        fs.unlinkSync(uploadedFilePath);
        fs.unlinkSync(outputFilePath);
      });
    }
  );
});

// ==========================
// 📌 5️⃣ Unlock PDF (Remove Password)
// ==========================
app.post("/unlock-pdf", upload.single("pdf"), (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).send("Password is required.");

  const uploadedFilePath = req.file.path;
  const outputFilePath = path.join("uploads", `unlocked_${req.file.originalname}`);

  exec(`qpdf "${uploadedFilePath}" --password=${password} --decrypt -- "${outputFilePath}"`, (err) => {
    if (err) return res.status(500).send("Error unlocking PDF.");
    res.download(outputFilePath, () => {
      fs.unlinkSync(uploadedFilePath);
      fs.unlinkSync(outputFilePath);
    });
  });
});

// ==========================
// 📌 6️⃣ File Upload and Extraction
// ==========================

// Multer setup for file uploads
const fileUpload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}).single('file');

// Helper function to recursively list files
const listFilesRecursively = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(listFilesRecursively(filePath));
    } else {
      results.push({
        name: file,
        path: filePath,
        relativePath: path.relative('extracted_files', filePath),
      });
    }
  });

  return results;
};

// Upload and extraction endpoint
app.post('/upload', (req, res) => {
  fileUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload error', message: err.message });
    }

    let filePath = req.file.path;
    const fileName = req.file.originalname;
    const outputDir = path.join('extracted_files', path.basename(fileName, path.extname(fileName)));

    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      await extractFile(filePath, fileName, outputDir);
      const extractedFiles = listFilesRecursively(outputDir);

      res.status(200).json({ message: 'File extracted successfully!', extractedFiles });
    } catch (error) {
      res.status(500).json({ error: 'Extraction error', message: error.message });
    } finally {
      if (filePath) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Failed to delete the uploaded file:', err.message);
        }
      }
    }
  });
});

// Download file endpoint (Fixed for nested files)
app.get('/download/*', (req, res) => {
  const filePath = path.join(__dirname, 'extracted_files', req.params[0]);
  console.log("Attempting to download file:", filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Use res.download with dotfiles allowed
  res.download(filePath, path.basename(filePath), { dotfiles: 'allow' }, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      return res.status(500).json({ error: 'Error downloading file' });
    }
  });
});


// ==========================
// 📌 7️⃣ Convert PDF to Word
// ==========================
app.post("/convert-pdf-to-word", upload.single("file"), (req, res) => {
  const pdfPath = req.file.path; // Path of uploaded file
  const outputPath = `${pdfPath}.docx`; // Output file path

  const scriptPath = path.join(__dirname, "convert_pdf_to_doc.py");
  const command = `python ${scriptPath} "${pdfPath}" "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Error during conversion:", error);
      return res.status(500).send("Error during conversion.");
    }

    // Check if output file exists
    if (!fs.existsSync(outputPath)) {
      return res.status(500).send("Conversion failed: No output file.");
    }

    res.download(outputPath, "converted.docx", (err) => {
      if (err) console.error("Error sending file:", err);

      // Cleanup
      fs.unlinkSync(pdfPath);
      fs.unlinkSync(outputPath);
    });
  });
});

// ==========================
// 🚀 Start the server
// ==========================
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});