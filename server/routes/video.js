// routes/video.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv|webm|mp3|wav|aac/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video and audio files are allowed.'));
    }
  }
});

// Get video duration using ffprobe
const getVideoDuration = async (filePath) => {
  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error('Error getting video duration:', error);
    return 0;
  }
};

// ============================================
// UPLOAD VIDEO/AUDIO
// ============================================
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log('✅ File uploaded:', req.file.filename);

    // Get video duration
    const duration = await getVideoDuration(req.file.path);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        duration: duration
      }
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload file'
    });
  }
});

// ============================================
// PROCESS VIDEO WITH FILTERS, TEXT, AUDIO
// ============================================
router.post('/process', async (req, res) => {
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
      return res.status(400).json({
        success: false,
        error: 'Input file is required'
      });
    }

    const inputPath = path.join(__dirname, '../uploads', inputFile);
    const outputPath = path.join(__dirname, '../processed', outputName);

    // Ensure processed directory exists
    const processedDir = path.join(__dirname, '../processed');
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }

    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({
        success: false,
        error: 'Input file not found'
      });
    }

    console.log('🎬 Processing video:', inputFile);
    console.log('Filters:', filters);
    console.log('Text overlays:', textOverlays);

    // Build FFmpeg filter chain
    let filterComplex = [];
    let videoFilter = '[0:v]';

    // Apply color filters
    if (filters) {
      const colorFilters = [];
      
      if (filters.brightness !== 100) {
        const brightnessValue = (filters.brightness - 100) / 100;
        colorFilters.push(`eq=brightness=${brightnessValue}`);
      }
      
      if (filters.contrast !== 100) {
        const contrastValue = filters.contrast / 100;
        colorFilters.push(`eq=contrast=${contrastValue}`);
      }
      
      if (filters.saturation !== 100) {
        const saturationValue = filters.saturation / 100;
        colorFilters.push(`eq=saturation=${saturationValue}`);
      }
      
      if (filters.grayscale > 0) {
        const grayscaleValue = filters.grayscale / 100;
        colorFilters.push(`hue=s=${1 - grayscaleValue}`);
      }

      if (colorFilters.length > 0) {
        videoFilter += colorFilters.join(',');
        videoFilter += '[v1]';
        filterComplex.push(videoFilter);
        videoFilter = '[v1]';
      }
    }

    // Add text overlays
    if (textOverlays && textOverlays.length > 0) {
      textOverlays.forEach((text, index) => {
        const escapedText = text.text.replace(/'/g, "\\'").replace(/:/g, "\\:");
        const fontSize = text.size || 36;
        const color = text.color || '#FFFFFF';
        const position = text.position || 200;
        
        // Text timing
        const startTime = text.startTime || 0;
        const endTime = startTime + (text.duration || 5);
        
        const textFilter = `drawtext=text='${escapedText}':fontsize=${fontSize}:fontcolor=${color}:x=(w-text_w)/2:y=${position}:enable='between(t,${startTime},${endTime})'`;
        
        if (index === 0) {
          filterComplex.push(`${videoFilter}${textFilter}[v${index + 2}]`);
        } else {
          filterComplex.push(`[v${index + 1}]${textFilter}[v${index + 2}]`);
        }
        videoFilter = `[v${index + 2}]`;
      });
    }

    // Build FFmpeg command
    let ffmpegCommand = `ffmpeg -i "${inputPath}"`;

    // Add audio if provided
    if (audioFile) {
      const audioPath = path.join(__dirname, '../uploads', audioFile);
      if (fs.existsSync(audioPath)) {
        ffmpegCommand += ` -i "${audioPath}"`;
        ffmpegCommand += ' -filter_complex "[1:a]volume=0.5[a1];[0:a][a1]amix=inputs=2:duration=first[aout]"';
        ffmpegCommand += ' -map "[vout]" -map "[aout]"';
      }
    }

    // Add filter complex if any filters or text overlays exist
    if (filterComplex.length > 0) {
      const finalVideoOutput = videoFilter.replace('[', '').replace(']', '');
      ffmpegCommand += ` -filter_complex "${filterComplex.join(';')}" -map "[${finalVideoOutput}]"`;
      
      // If no audio processing, map original audio
      if (!audioFile) {
        ffmpegCommand += ' -map 0:a?';
      }
    } else {
      // No filters, just copy streams
      ffmpegCommand += ' -c:v copy -c:a copy';
    }

    // Add trim if specified
    if (trim && (trim.start > 0 || trim.end)) {
      if (trim.start > 0) {
        ffmpegCommand += ` -ss ${trim.start}`;
      }
      if (trim.end && trim.end !== trim.start) {
        ffmpegCommand += ` -t ${trim.end - trim.start}`;
      }
    }

    // Output settings
    ffmpegCommand += ` -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k "${outputPath}" -y`;

    console.log('🎬 FFmpeg command:', ffmpegCommand);

    // Execute FFmpeg
    await execPromise(ffmpegCommand);

    console.log('✅ Video processed successfully:', outputName);

    // Return download URL
    res.json({
      success: true,
      message: 'Video processed successfully',
      downloadUrl: `/processed/${outputName}`,
      outputFile: outputName
    });

  } catch (error) {
    console.error('❌ Processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process video'
    });
  }
});

// ============================================
// GET LIST OF UPLOADED FILES
// ============================================
router.get('/files', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    const processedDir = path.join(__dirname, '../processed');

    const uploadedFiles = fs.existsSync(uploadsDir) 
      ? fs.readdirSync(uploadsDir).map(file => ({
          name: file,
          path: `/uploads/${file}`,
          type: 'uploaded'
        }))
      : [];

    const processedFiles = fs.existsSync(processedDir)
      ? fs.readdirSync(processedDir).map(file => ({
          name: file,
          path: `/processed/${file}`,
          type: 'processed'
        }))
      : [];

    res.json({
      success: true,
      files: {
        uploaded: uploadedFiles,
        processed: processedFiles
      }
    });
  } catch (error) {
    console.error('❌ Error listing files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list files'
    });
  }
});

// ============================================
// DELETE FILE
// ============================================
router.delete('/file/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    const dirMap = {
      'uploaded': 'uploads',
      'processed': 'processed'
    };

    const dir = dirMap[type];
    if (!dir) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type'
      });
    }

    const filePath = path.join(__dirname, '..', dir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    fs.unlinkSync(filePath);

    console.log('✅ File deleted:', filename);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
});

module.exports = router;cd