import React, { useState, useEffect } from 'react';
import { File, ImageIcon, FileText, Film, Download, MoreHorizontal, Upload } from "lucide-react";
import axios from 'axios';

const FileSharing = ({ teamId }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch files when team changes
  useEffect(() => {
    if (!teamId) return;

    const fetchFiles = async () => {
      try {
        const response = await axios.get(`/api/files/${teamId}`);
        setFiles(response.data);
      } catch (err) {
        console.error('Error fetching files:', err);
      }
    };

    fetchFiles();
  }, [teamId]);

  const uploadFile = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`/api/files/${teamId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFiles(prev => [...prev, response.data]);
      setSelectedFile(null);
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 border-l border-gray-200">
      <h3 className="text-lg font-semibold mb-3">Files</h3>
      <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
      <button onClick={uploadFile} className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Upload</button>

      <div className="mt-4 space-y-2">
        {files.map(file => (
          <div key={file.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
            <span>{file.name}</span>
            <a href={file.url} download className="text-blue-500">Download</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileSharing;
