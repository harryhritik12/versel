const fs = require('fs');
const path = require('path');
const extractZip = require('extract-zip');
const tar = require('tar');
const Unrar = require('node-unrar-js');

// Helper function to extract .zip files
const extractZipFile = async (filePath, outputDir) => {
  try {
    const absoluteOutputDir = path.resolve(outputDir); // Ensure the output directory is absolute
    
    // Wrap extract-zip in a promise for async/await compatibility
    await new Promise((resolve, reject) => {
      extractZip(filePath, { dir: absoluteOutputDir }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    console.log("ZIP extraction complete!");
  } catch (err) {
    console.error('Error extracting ZIP file:', err.message);
    throw new Error('Failed to extract ZIP file');
  }
};

// Helper function to extract .tar files
const extractTarFile = async (filePath, outputDir) => {
  try {
    await tar.extract({ file: filePath, cwd: outputDir });
    console.log("TAR extraction complete!");
  } catch (err) {
    console.error('Error extracting TAR file:', err.message);
    throw new Error('Failed to extract TAR file');
  }
};

// Helper function to extract .rar files
const extractRarFile = async (filePath, outputDir) => {
  try {
    if (!outputDir || typeof outputDir !== 'string' || outputDir.trim() === '') {
      throw new Error('Invalid output directory path.');
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const buf = Uint8Array.from(fs.readFileSync(filePath)).buffer;
    const extractor = await Unrar.createExtractorFromData({ data: buf });

    const list = extractor.getFileList();
    const fileHeaders = [...list.fileHeaders];

    const extracted = extractor.extract({});
    const files = [...extracted.files];

    files.forEach(file => {
      const outputPath = path.join(outputDir, file.fileHeader.name);
      const fileDir = path.dirname(outputPath);

      try {
        if (file.fileHeader.flags.directory) {
          if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
          }
        } else {
          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
          }

          if (file.extraction) {
            fs.writeFileSync(outputPath, Buffer.from(file.extraction));
          } else {
            console.error(`Failed to extract: ${file.fileHeader.name}`);
          }
        }
      } catch (err) {
        console.error(`Error processing file: ${file.fileHeader.name}`, err.message);
      }
    });

    console.log("RAR extraction complete!");
  } catch (err) {
    console.error("Error extracting RAR file:", err.message);
    return {
      error: 'Extraction failed',
      details: `Failed to extract RAR file: ${err.message}`
    };
  }
};

// Main extraction function
const extractFile = async (filePath, fileName, outputDir) => {
  if (fileName.endsWith('.zip')) {
    await extractZipFile(filePath, outputDir);
  } else if (fileName.endsWith('.tar')) {
    await extractTarFile(filePath, outputDir);
  } else if (fileName.endsWith('.rar')) {
    await extractRarFile(filePath, outputDir);
  } else {
    throw new Error('Unsupported file format. Please upload a .zip, .tar, or .rar file.');
  }
};

module.exports = { extractFile };
