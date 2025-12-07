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
    const allowedTypes = /mp4|mov|avi|mkv|webm|mp3|wav|aac|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('image/');

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video, audio, and image files are allowed.'));
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

// Get video properties
const getVideoProperties = async (filePath) => {
  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 "${filePath}"`
    );
    const [width, height, fps] = stdout.trim().split(',');
    const framerate = fps ? eval(fps) : 30; // Convert "30/1" to 30
    return { width: parseInt(width), height: parseInt(height), framerate };
  } catch (error) {
    console.error('Error getting video properties:', error);
    return { width: 1920, height: 1080, framerate: 30 };
  }
};

// ============================================
// UPLOAD VIDEO/AUDIO/IMAGE
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

    // Get video duration (0 for images)
    let duration = 0;
    if (!req.file.mimetype.startsWith('image/')) {
      duration = await getVideoDuration(req.file.path);
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        duration: duration,
        type: req.file.mimetype
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
// PROCESS VIDEO WITH FILTERS, TEXT, AUDIO, SPLITS, INSERTS
// ============================================
router.post('/process', async (req, res) => {
  try {
    const {
      inputFile,
      outputName,
      trim,
      filters,
      textOverlays,
      audioFile,
      clips,
      keepOriginalAudio
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
    console.log('📊 Clips to process:', clips?.length || 0);
    console.log('🔊 Keep original audio:', keepOriginalAudio);

    const tempFiles = [];
    let processedVideoPath = inputPath;

    // ==================================================
    // STEP 1: Handle clips (splits and inserts)
    // ==================================================
   // ==================================================
// STEP 1: Handle clips (splits and inserts)
// ==================================================
if (clips && clips.length > 0) {
  console.log('🎞️ Processing clips and splits...');
  
  // Get original video properties
  const videoProps = await getVideoProperties(inputPath);
  console.log('📐 Video properties:', videoProps);
  
  // Create timeline segments
  const concatFilePath = path.join(__dirname, '../uploads', `concat_${Date.now()}.txt`);
  tempFiles.push(concatFilePath);
  let concatContent = '';
  
  // Sort all clips by time
  const sortedClips = [...clips].sort((a, b) => {
    const timeA = a.startTime || a.insertAt || 0;
    const timeB = b.startTime || b.insertAt || 0;
    return timeA - timeB;
  });

  console.log('📋 Sorted clips:', sortedClips.map(c => ({
    type: c.type,
    time: c.startTime || c.insertAt,
    duration: c.duration
  })));

  let lastTime = trim?.start || 0;
  const endTime = trim?.end || await getVideoDuration(inputPath);
  let segmentIndex = 0;

  // Build timeline segments
  for (const clip of sortedClips) {
    const clipTime = clip.startTime || clip.insertAt;
    
    // Add segment from lastTime to current clip
    if (clipTime > lastTime) {
      const segmentDuration = clipTime - lastTime;
      console.log(`➕ Adding main video segment: ${lastTime}s to ${clipTime}s (${segmentDuration}s)`);
      
      const segmentFile = path.join(__dirname, '../uploads', `segment_${Date.now()}_${segmentIndex++}.mp4`);
      tempFiles.push(segmentFile);
      
      await execPromise(
        `ffmpeg -ss ${lastTime} -i "${inputPath}" -t ${segmentDuration} -c:v libx264 -preset fast -c:a aac -b:a 192k -ar 48000 -ac 2 "${segmentFile}" -y`
      );
      concatContent += `file '${segmentFile}'\n`;
    }

    // Handle split (just marks division point, doesn't insert anything)
    if (clip.type === 'split') {
      console.log(`✂️ Split marker at ${clipTime}s`);
      lastTime = clipTime;
      continue;
    }

    // Handle video/image insert
    if (clip.type === 'video' || clip.type === 'image') {
      const insertedFilePath = path.join(__dirname, '../uploads', clip.filename);
      
      if (!fs.existsSync(insertedFilePath)) {
        console.warn(`⚠️ Inserted file not found: ${clip.filename}`);
        continue;
      }

      console.log(`🎬 Inserting ${clip.type} at ${clipTime}s: ${clip.filename}`);
      
      const processedClipFile = path.join(__dirname, '../uploads', `clip_insert_${Date.now()}_${segmentIndex++}.mp4`);
      tempFiles.push(processedClipFile);

      if (clip.type === 'image') {
        // Convert image to video segment with matching properties and silent audio
        const imageDuration = clip.duration || 3;
        console.log(`📷 Converting image to ${imageDuration}s video with silent audio`);
        
        await execPromise(
          `ffmpeg -loop 1 -i "${insertedFilePath}" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 -t ${imageDuration} ` +
          `-vf "scale=${videoProps.width}:${videoProps.height}:force_original_aspect_ratio=decrease,` +
          `pad=${videoProps.width}:${videoProps.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${videoProps.framerate}" ` +
          `-c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest "${processedClipFile}" -y`
        );
      } else {
        // Process inserted video - resize to match main video, handle audio
        console.log(`🎥 Processing inserted video (muted: ${clip.muteInsertedClip})`);
        
        // Mute inserted clip if specified OR if keeping original audio
        if (clip.muteInsertedClip !== false || keepOriginalAudio) {
          // Add silent audio track
          await execPromise(
            `ffmpeg -i "${insertedFilePath}" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 ` +
            `-vf "scale=${videoProps.width}:${videoProps.height}:force_original_aspect_ratio=decrease,` +
            `pad=${videoProps.width}:${videoProps.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${videoProps.framerate}" ` +
            `-c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest "${processedClipFile}" -y`
          );
        } else {
          // Keep inserted clip audio
          await execPromise(
            `ffmpeg -i "${insertedFilePath}" ` +
            `-vf "scale=${videoProps.width}:${videoProps.height}:force_original_aspect_ratio=decrease,` +
            `pad=${videoProps.width}:${videoProps.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${videoProps.framerate}" ` +
            `-c:v libx264 -preset fast -c:a aac -b:a 192k -ar 48000 -ac 2 "${processedClipFile}" -y`
          );
        }
      }
      
      concatContent += `file '${processedClipFile}'\n`;
      lastTime = clipTime; // Don't advance time for inserts - they're additions
    }
  }

  // Add remaining video after last clip/split
  if (lastTime < endTime) {
    const remainingDuration = endTime - lastTime;
    console.log(`➕ Adding final segment: ${lastTime}s to ${endTime}s (${remainingDuration}s)`);
    
    const finalSegmentFile = path.join(__dirname, '../uploads', `segment_${Date.now()}_final.mp4`);
    tempFiles.push(finalSegmentFile);
    
    await execPromise(
      `ffmpeg -ss ${lastTime} -i "${inputPath}" -t ${remainingDuration} -c:v libx264 -preset fast -c:a aac -b:a 192k -ar 48000 -ac 2 "${finalSegmentFile}" -y`
    );
    concatContent += `file '${finalSegmentFile}'\n`;
  }

  // Write concat file
  fs.writeFileSync(concatFilePath, concatContent);
  console.log('📝 Concat file created with', concatContent.split('\n').filter(Boolean).length, 'segments');

  // Concatenate all segments
  const concatenatedFile = path.join(__dirname, '../uploads', `concatenated_${Date.now()}.mp4`);
  tempFiles.push(concatenatedFile);
  
  console.log('🔗 Concatenating segments...');
  
  // Use concat demuxer with copy - all segments now have matching audio
  await execPromise(
    `ffmpeg -f concat -safe 0 -i "${concatFilePath}" -c copy "${concatenatedFile}" -y`
  );
  
  processedVideoPath = concatenatedFile;
  console.log('✅ Concatenated successfully');
  
} else if (trim && (trim.start > 0 || trim.end)) {
  // Apply trim without clips
  console.log('✂️ Applying trim only...');
  const trimmedFile = path.join(__dirname, '../uploads', `trimmed_${Date.now()}.mp4`);
  tempFiles.push(trimmedFile);
  
  let trimCmd = `ffmpeg -ss ${trim.start || 0} -i "${inputPath}"`;
  if (trim.end) trimCmd += ` -t ${trim.end - (trim.start || 0)}`;
  trimCmd += ` -c:v libx264 -preset fast -c:a aac -b:a 192k -ar 48000 -ac 2 "${trimmedFile}" -y`;
  
  await execPromise(trimCmd);
  processedVideoPath = trimmedFile;
} else if (trim && (trim.start > 0 || trim.end)) {
      // Apply trim without clips
      console.log('✂️ Applying trim only...');
      const trimmedFile = path.join(__dirname, '../uploads', `trimmed_${Date.now()}.mp4`);
      tempFiles.push(trimmedFile);
      
      let trimCmd = `ffmpeg -i "${inputPath}"`;
      if (trim.start > 0) trimCmd += ` -ss ${trim.start}`;
      if (trim.end) trimCmd += ` -t ${trim.end - (trim.start || 0)}`;
      trimCmd += ` -c copy "${trimmedFile}" -y`;
      
      await execPromise(trimCmd);
      processedVideoPath = trimmedFile;
    }

    // ==================================================
    // STEP 2: Apply filters and text overlays
    // ==================================================
    console.log('🎨 Applying filters and effects...');
    
    let ffmpegCommand = `ffmpeg -i "${processedVideoPath}"`;
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
      console.log(`📝 Adding ${textOverlays.length} text overlays...`);
      textOverlays.forEach((text, index) => {
        const escapedText = text.text.replace(/'/g, "\\'").replace(/:/g, "\\:");
        const fontSize = text.size || 36;
        const color = text.color || '#FFFFFF';
        const x = text.x || 400;
        const y = text.y || 225;
        const startTime = text.startTime || 0;
        const endTime = startTime + (text.duration || 5);
        
        const textFilter = `drawtext=text='${escapedText}':fontsize=${fontSize}:fontcolor=${color}:x=${x}:y=${y}:enable='between(t,${startTime},${endTime})'`;
        
        if (index === 0 && filterComplex.length === 0) {
          filterComplex.push(`${videoFilter}${textFilter}[v${index + 2}]`);
        } else if (index === 0) {
          filterComplex.push(`${videoFilter}${textFilter}[v${index + 2}]`);
        } else {
          const prevLabel = `[v${index + 1}]`;
          filterComplex.push(`${prevLabel}${textFilter}[v${index + 2}]`);
        }
        videoFilter = `[v${index + 2}]`;
      });
    }

    // Add background audio if provided
    if (audioFile) {
      const audioPath = path.join(__dirname, '../uploads', audioFile);
      if (fs.existsSync(audioPath)) {
        console.log('🎵 Adding background audio...');
        ffmpegCommand += ` -i "${audioPath}"`;
        
        const finalVideoLabel = videoFilter.replace('[', '').replace(']', '');
        
        if (filterComplex.length > 0) {
          const audioMixFilter = `[1:a]volume=0.5[a1];[0:a][a1]amix=inputs=2:duration=first[aout]`;
          filterComplex.push(audioMixFilter);
          ffmpegCommand += ` -filter_complex "${filterComplex.join(';')}" -map "[${finalVideoLabel}]" -map "[aout]"`;
        } else {
          ffmpegCommand += ` -filter_complex "[1:a]volume=0.5[a1];[0:a][a1]amix=inputs=2:duration=first[aout]" -map 0:v -map "[aout]"`;
        }
      }
    } else {
      if (filterComplex.length > 0) {
        const finalVideoOutput = videoFilter.replace('[', '').replace(']', '');
        ffmpegCommand += ` -filter_complex "${filterComplex.join(';')}" -map "[${finalVideoOutput}]" -map 0:a?`;
      } else {
        ffmpegCommand += ' -map 0:v -map 0:a?';
      }
    }

    // Output settings
    ffmpegCommand += ` -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k "${outputPath}" -y`;

    console.log('🎬 Executing final FFmpeg command...');
    await execPromise(ffmpegCommand);

    // Clean up temporary files
    console.log('🗑️ Cleaning up temporary files...');
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (e) {
          console.error('Error deleting temp file:', e);
        }
      }
    });

    console.log('✅ Video processed successfully!');

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

module.exports = router;