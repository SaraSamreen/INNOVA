import React from "react";
import { useState } from "react";
import { File, ImageIcon, FileText, Film, Download, MoreHorizontal, Upload } from "lucide-react";

const FileSharing = ({ teamId }) => {
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "Project_Brief.pdf",
      type: "pdf",
      size: "2.4 MB",
      uploadedBy: "John Doe",
      uploadedAt: "2 hours ago",
    },
    {
      id: 2,
      name: "Homepage_Design.png",
      type: "image",
      size: "4.1 MB",
      uploadedBy: "Sarah Smith",
      uploadedAt: "1 day ago",
    },
    {
      id: 3,
      name: "Meeting_Notes.docx",
      type: "document",
      size: "1.2 MB",
      uploadedBy: "You",
      uploadedAt: "3 days ago",
    },
    {
      id: 4,
      name: "Product_Demo.mp4",
      type: "video",
      size: "24.6 MB",
      uploadedBy: "Mike Johnson",
      uploadedAt: "1 week ago",
    },
  ]);

  const [activeTab, setActiveTab] = useState("all");

  const getFileIcon = (type) => {
    switch (type) {
      case "image":
        return <ImageIcon size={20} />;
      case "document":
        return <FileText size={20} />;
      case "video":
        return <Film size={20} />;
      default:
        return <File size={20} />;
    }
  };

  const filteredFiles = activeTab === "all" ? files : files.filter((file) => file.type === activeTab);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    // In a real app, you would upload the file to a server
    const fileType = uploadedFile.type.split("/")[0];
    const newFile = {
      id: Date.now(),
      name: uploadedFile.name,
      type:
        fileType === "image"
          ? "image"
          : fileType === "video"
            ? "video"
            : fileType === "application"
              ? "document"
              : "other",
      size: (uploadedFile.size / (1024 * 1024)).toFixed(1) + " MB",
      uploadedBy: "You",
      uploadedAt: "Just now",
    };

    setFiles([newFile, ...files]);
  };

  return (
    <div className="file-sharing">
      <div className="file-sharing-header">
        <h3>Shared Files</h3>
        <div className="file-upload">
          <label htmlFor="file-upload" className="upload-btn">
            <Upload size={16} />
            <span>Upload</span>
          </label>
          <input id="file-upload" type="file" style={{ display: "none" }} onChange={handleFileUpload} />
        </div>
      </div>

      <div className="file-tabs">
        <button className={`file-tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
          All
        </button>
        <button className={`file-tab ${activeTab === "image" ? "active" : ""}`} onClick={() => setActiveTab("image")}>
          Images
        </button>
        <button
          className={`file-tab ${activeTab === "document" ? "active" : ""}`}
          onClick={() => setActiveTab("document")}
        >
          Documents
        </button>
        <button className={`file-tab ${activeTab === "video" ? "active" : ""}`} onClick={() => setActiveTab("video")}>
          Videos
        </button>
      </div>

      <div className="files-list">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-icon">{getFileIcon(file.type)}</div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-meta">
                  {file.size} • Uploaded by {file.uploadedBy} • {file.uploadedAt}
                </div>
              </div>
              <div className="file-actions">
                <button className="download-btn">
                  <Download size={16} />
                </button>
                <button className="more-btn">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-files">
            <p>No files found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileSharing;