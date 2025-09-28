import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';
import { cloudinary } from '../config/cloudinary.js';

// Upload course image
export const uploadCourseImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    const imageData = await uploadToCloudinary(
      req.file,
      'course-thumbnails',
      {
        transformation: [
          { width: 800, height: 600, crop: 'fill', quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Course image uploaded successfully',
      data: {
        url: imageData.url,
        publicId: imageData.publicId,
        width: imageData.width,
        height: imageData.height,
        format: imageData.format,
        size: imageData.size
      }
    });
  } catch (error) {
    console.error('Error uploading course image:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload course image'
    });
  }
};

// Upload lecture video
export const uploadLectureVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No video file provided'
      });
    }

    const videoData = await uploadToCloudinary(
      req.file,
      'lecture-videos',
      {
        resource_type: 'video',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      }
    );

    // Generate video thumbnail
    const thumbnailUrl = cloudinary.url(videoData.publicId, {
      resource_type: 'video',
      transformation: [
        { width: 400, height: 300, crop: 'fill', quality: 'auto:low' },
        { format: 'jpg', start_offset: '10' }
      ]
    });

    res.status(200).json({
      status: 'success',
      message: 'Lecture video uploaded successfully',
      data: {
        url: videoData.url,
        publicId: videoData.publicId,
        duration: videoData.duration,
        format: videoData.format,
        size: videoData.size,
        thumbnailUrl
      }
    });
  } catch (error) {
    console.error('Error uploading lecture video:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload lecture video'
    });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    const imageData = await uploadToCloudinary(
      req.file,
      'profile-images',
      {
        transformation: [
          { width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile image uploaded successfully',
      data: {
        url: imageData.url,
        publicId: imageData.publicId,
        width: imageData.width,
        height: imageData.height,
        format: imageData.format,
        size: imageData.size
      }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload profile image'
    });
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files provided'
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const isVideo = file.mimetype.startsWith('video/');
      const folder = isVideo ? 'lecture-videos' : 'course-materials';
      
      return uploadToCloudinary(
        file,
        folder,
        {
          resource_type: isVideo ? 'video' : 'auto',
          transformation: isVideo ? [{ quality: 'auto:good' }] : []
        }
      );
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.status(200).json({
      status: 'success',
      message: `${uploadResults.length} files uploaded successfully`,
      data: {
        files: uploadResults.map(result => ({
          url: result.url,
          publicId: result.publicId,
          format: result.format,
          size: result.size,
          duration: result.duration, // for videos
          width: result.width,
          height: result.height
        }))
      }
    });
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload files'
    });
  }
};

// Delete file from Cloudinary
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    if (!publicId) {
      return res.status(400).json({
        status: 'error',
        message: 'Public ID is required'
      });
    }

    const result = await deleteFromCloudinary(publicId, resourceType);

    if (result.result === 'ok') {
      res.status(200).json({
        status: 'success',
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'File not found or already deleted'
      });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete file'
    });
  }
};

// Get upload signature for direct client uploads
export const getUploadSignature = async (req, res) => {
  try {
    const { folder, resourceType = 'auto' } = req.body;

    if (!folder) {
      return res.status(400).json({
        status: 'error',
        message: 'Folder is required'
      });
    }

    const timestamp = Math.round((new Date()).getTime() / 1000);
    
    const params = {
      timestamp,
      folder: `bookmyshow-lms/${folder}`,
      resource_type: resourceType
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      status: 'success',
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: params.folder,
        resourceType
      }
    });
  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate upload signature'
    });
  }
};

// Process video upload (for large videos with chunked upload)
export const processVideoUpload = async (req, res) => {
  try {
    const { publicId, chunkIndex, totalChunks } = req.body;

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No video chunk provided'
      });
    }

    // For now, we'll handle this as a regular upload
    // In a production system, you would implement chunked upload logic
    const videoData = await uploadToCloudinary(
      req.file,
      'lecture-videos',
      {
        resource_type: 'video',
        public_id: publicId,
        transformation: [
          { quality: 'auto:good' }
        ]
      }
    );

    // Generate preview thumbnail
    const thumbnailUrl = cloudinary.url(videoData.publicId, {
      resource_type: 'video',
      transformation: [
        { width: 400, height: 300, crop: 'fill', quality: 'auto:low' },
        { format: 'jpg', start_offset: '10' }
      ]
    });

    res.status(200).json({
      status: 'success',
      message: 'Video processed successfully',
      data: {
        url: videoData.url,
        publicId: videoData.publicId,
        duration: videoData.duration,
        format: videoData.format,
        size: videoData.size,
        thumbnailUrl,
        isComplete: true // In chunked upload, this would be true only for the last chunk
      }
    });
  } catch (error) {
    console.error('Error processing video upload:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process video upload'
    });
  }
};