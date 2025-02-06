const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const cors = require('cors');
const { extractFile } = require('./extractor'); // Ensure this function works correctly

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), async (req, res) => {
  const { directory } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const extractionDir = directory || path.join(os.homedir(), 'ExtractedFiles');

  try {
    if (!fs.existsSync(extractionDir)) {
      fs.mkdirSync(extractionDir, { recursive: true });
    }

    await extractFile(file.path, extractionDir);

    const extractedFiles = fs.readdirSync(extractionDir).map((name) => ({
      name,
      relativePath: path.join(extractionDir, name),
    }));

    res.json({ message: 'File extracted successfully.', extractedFiles });
  } catch (err) {
    console.error('Error during extraction:', err.message);
    res.status(500).json({ error: 'Failed to extract file.', details: err.message });
  } finally {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.warn('Error deleting temp file:', err.message);
    }
  }
});

app.get('/download/:fileName', (req, res) => {
  const filePath = path.join(os.homedir(), 'ExtractedFiles', req.params.fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found.' });
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err.message);
      res.status(500).json({ error: 'Failed to download file.' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
