const path = require("path");
const fs = require("fs");

let files = {}; // in-memory storage { teamId: [files] }

exports.getFiles = (req, res) => {
  const { teamId } = req.params;
  res.json(files[teamId] || []);
};

exports.uploadFile = (req, res) => {
  const { teamId } = req.params;
  if (!req.file) return res.status(400).send("No file uploaded");

  const fileInfo = {
    id: Date.now(),
    name: req.file.originalname,
    type: req.file.mimetype.split("/")[0],
    size: (req.file.size / (1024 * 1024)).toFixed(1) + " MB",
    uploadedBy: "You",
    uploadedAt: "Just now",
  };

  if (!files[teamId]) files[teamId] = [];
  files[teamId].unshift(fileInfo);

  res.json(fileInfo);
};
