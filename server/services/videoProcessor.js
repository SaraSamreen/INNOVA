const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

class VideoProcessor {
  async getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          resolve({
            duration: metadata.format.duration,
            format: metadata.format.format_name,
            size: metadata.format.size,
            bitrate: metadata.format.bit_rate,
            width: videoStream?.width,
            height: videoStream?.height,
            fps: videoStream?.r_frame_rate
          });
        }
      });
    });
  }

  async processVideo(options) {
    const {
      inputPath,
      outputName,
      trim,
      filters,
      textOverlays,
      audioFile
    } = options;

    const outputPath = path.join(__dirname, '..', 'processed', outputName);

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      if (trim && trim.start !== undefined && trim.end !== undefined) {
        command = command
          .setStartTime(trim.start)
          .setDuration(trim.end - trim.start);
      }

      const videoFilters = [];

      if (filters) {
        const filterParts = [];
        
        if (filters.brightness !== 100) {
          const brightnessVal = (filters.brightness - 100) / 100;
          filterParts.push(`eq=brightness=${brightnessVal}`);
        }
        
        if (filters.contrast !== 100) {
          const contrastVal = filters.contrast / 100;
          filterParts.push(`eq=contrast=${contrastVal}`);
        }
        
        if (filters.saturation !== 100) {
          const saturationVal = filters.saturation / 100;
          filterParts.push(`eq=saturation=${saturationVal}`);
        }
        
        if (filters.grayscale > 0) {
          filterParts.push(`hue=s=${1 - (filters.grayscale / 100)}`);
        }

        if (filterParts.length > 0) {
          videoFilters.push(filterParts.join(','));
        }
      }

      if (textOverlays && textOverlays.length > 0) {
        textOverlays.forEach((text) => {
          const escapedText = text.text.replace(/'/g, "\\'").replace(/:/g, "\\:");
          const textFilter = `drawtext=text='${escapedText}':` +
            `fontsize=${text.size}:` +
            `fontcolor=${text.color}:` +
            `x=(w-text_w)/2:` +
            `y=(h-text_h)/2:` +
            `enable='between(t,${text.startTime},${text.startTime + text.duration})'`;
          videoFilters.push(textFilter);
        });
      }

      if (videoFilters.length > 0) {
        command = command.videoFilters(videoFilters);
      }

      if (audioFile && fs.existsSync(audioFile)) {
        command = command.input(audioFile);
      }

      command
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          '-crf 22',
          '-c:a aac',
          '-b:a 192k'
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing: ' + Math.round(progress.percent) + '% done');
        })
        .on('end', () => {
          console.log('Processing finished successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Error processing video:', err);
          reject(err);
        })
        .run();
    });
  }
}

module.exports = new VideoProcessor();