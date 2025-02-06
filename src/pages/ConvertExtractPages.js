import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaFileAlt, FaFolder, FaDownload, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import '../styles/convert.css';
import { motion } from 'framer-motion';

const ConvertExtractPages = () => {
  const location = useLocation();
  const file = location.state?.file || null;
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showFileList, setShowFileList] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const handleExtractFiles = async () => {
    if (!file) {
      setError('No file selected.');
      return;
    }
    const allowedExtensions = ['zip', 'tar', 'rar'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Only .zip, .tar, and .rar files are supported.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('https://versel-rxs2.onrender.com/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExtractedFiles(response.data.extractedFiles);
      setMessage('File extracted successfully.');
      setError('');
    } catch (err) {
      setError('Error during extraction. Please check the file and try again.');
      console.error(err);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(extractedFiles.map((file) => file.name));
    }
    setSelectAll(!selectAll);
  };

  const handleDownloadSelected = async () => {
    selectedFiles.forEach((fileName, index) => {
      const file = extractedFiles.find((f) => f.name === fileName);
      if (file) {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = `https://versel-rxs2.onrender.com/download/${encodeURIComponent(file.relativePath)}`;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 500);
      }
    });
  };

  const handleDownloadAll = async () => {
    try {
      setSaving(true);
      const dirHandle = await window.showDirectoryPicker();
      
      for (const file of extractedFiles) {
        
        // Split relative path into components
        const pathParts = file.relativePath.split(/[\\/]/);
        const fileName = pathParts.pop();
        
        // Create nested directories
        let currentDir = dirHandle;
        for (const part of pathParts) {
          currentDir = await currentDir.getDirectoryHandle(part, { create: true });
        }
  
        // Fetch file content
        const response = await fetch(`https://versel-rxs2.onrender.com//download/${encodeURIComponent(file.relativePath)}`);
        const blob = await response.blob();
        
        // Create file in the appropriate directory
        const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      }
      
      setSaving(false);
      alert('Files saved with directory structure!');
    } catch (err) {
      setSaving(false);
      console.error('Error saving files:', err);
      alert('Failed to save files with structure.');
    }
  };

  return (
    <div className="convert-container">
      <h1 style={{ textAlign: 'center' }}>Extract Files from Archive</h1>
      {file ? (
        <>
          <p style={{ textAlign: 'center' }}>File to extract: {file.name}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button className="convert-button" onClick={handleExtractFiles}>Extract Files</button>
          </div>
          {message && <p className="message success" style={{ textAlign: 'center' }}>{message}</p>}
          {error && <p className="message error" style={{ textAlign: 'center' }}>{error}</p>}
          {extractedFiles.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <button className="toggle-button" onClick={() => setShowFileList(!showFileList)}>
                {showFileList ? 'Hide Files' : 'List all files'}
              </button>
              {showFileList && (
                <>
                  <button className="select-button" onClick={handleSelectAll}>
                    {selectAll ? <FaCheckSquare /> : <FaRegSquare />} Select All
                  </button>
                  <ul className="file-list">
                    {extractedFiles.map((file, index) => (
                      <li key={index} className="file-item">
                        {file.type === 'folder' ? <FaFolder /> : <FaFileAlt />}
                        {file.relativePath}
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.name)}
                          onChange={() => {
                            setSelectedFiles((prev) =>
                              prev.includes(file.name)
                                ? prev.filter((f) => f !== file.name)
                                : [...prev, file.name]
                            );
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="button-group" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button className="download-button" onClick={handleDownloadSelected} disabled={selectedFiles.length === 0}>
                  <FaDownload /> Download Selected
                </button>
                <button className="download-button" onClick={handleDownloadAll} disabled={saving}>
                  <FaDownload /> {saving ? 'Saving...' : 'Save All Extracted Files'}
                </button>
              </div>
              {saving && (
                <motion.div
                  className="blur-overlay"
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <p style={{ textAlign: 'center' }}>No file uploaded.</p>
      )}
    </div>
  );
};

export default ConvertExtractPages;
