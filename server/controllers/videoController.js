const path = require('path');
const fs = require('fs');
const videoProcessor = require('../services/videoProcessor');

// Upload video
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const videoInfo = await videoProcessor.getVideoMetadata(req.file.path);

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        duration: videoInfo.duration,
        format: videoInfo.format
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload video', message: error.message });
  }
};

// Process video (trim, filters, text, audio)
exports.processVideo = async (req, res) => {
  try {
    const {
      inputFile,
      outputName,
      trim,
      filters,
      textOverlays,
      audioFile
    } = req.body;

    if (!inputFile) {
      return res.status(400).json({ error: 'Input file is required' });
    }

    const inputPath = path.join(__dirname, '..', 'uploads', inputFile);
    
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'Input file not found' });
    }

    // Process the video
    const outputFile = await videoProcessor.processVideo({
      inputPath,
      outputName: outputName || `processed_${Date.now()}.mp4`,
      trim,
      filters,
      textOverlays,
      audioFile: audioFile ? path.join(__dirname, '..', 'uploads', audioFile) : null
    });

    res.json({
      success: true,
      message: 'Video processed successfully',
      outputFile: outputFile,
      downloadUrl: `/api/video/download/${path.basename(outputFile)}`
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Failed to process video', message: error.message });
  }
};

// Download processed video
exports.downloadVideo = (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'processed', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download video', message: error.message });
  }
};

// Delete video file
exports.deleteVideo = (req, res) => {
  try {
    const filename = req.params.filename;
    const uploadPath = path.join(__dirname, '..', 'uploads', filename);
    const processedPath = path.join(__dirname, '..', 'processed', filename);

    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath);
    }
    if (fs.existsSync(processedPath)) {
      fs.unlinkSync(processedPath);
    }

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file', message: error.message });
  }
};

// Get video information
exports.getVideoInfo = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const info = await videoProcessor.getVideoMetadata(filePath);
    res.json({ success: true, info });
  } catch (error) {
    console.error('Get info error:', error);
    res.status(500).json({ error: 'Failed to get video info', message: error.message });
  }
};