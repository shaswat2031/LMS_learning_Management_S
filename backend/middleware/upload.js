import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.js';

// Memory storage for processing before upload
const memoryStorage = multer.memoryStorage();

// File filter function
const createFileFilter = (allowedMimes) => {
  return (req, file, cb) => {
    if (allowedMimes.some(mime => file.mimetype.startsWith(mime))) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedMimes.join(', ')} files are allowed`), false);
    }
  };
};

// Generic upload middleware factory
export const createUploadMiddleware = (options = {}) => {
  const {
    storage = memoryStorage,
    fileFilter,
    limits = {},
    single = true,
    fieldName = 'file'
  } = options;

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB default
      ...limits
    }
  });

  return single ? upload.single(fieldName) : upload.array(fieldName, 10);
};

// Specific upload middlewares
export const uploadCourseImage = createUploadMiddleware({
  fileFilter: createFileFilter(['image']),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fieldName: 'thumbnail'
});

export const uploadVideo = createUploadMiddleware({
  fileFilter: createFileFilter(['video']),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fieldName: 'video'
});

export const uploadProfileImage = createUploadMiddleware({
  fileFilter: createFileFilter(['image']),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fieldName: 'profileImage'
});

export const uploadMultipleFiles = createUploadMiddleware({
  fileFilter: createFileFilter(['image', 'video', 'application']),
  single: false,
  fieldName: 'files'
});

// Cloudinary upload helper
export const uploadToCloudinary = async (file, folder, options = {}) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `bookmyshow-lms/${folder}`,
          resource_type: 'auto',
          ...options
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(file.buffer);
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration // for videos
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('File upload failed');
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('File deletion failed');
  }
};

// Image transformation helper
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    quality: 'auto:good',
    fetch_format: 'auto'
  };
  
  return cloudinary.url(publicId, {
    ...defaultTransformations,
    ...transformations
  });
};

// Video transformation helper
export const getOptimizedVideoUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    quality: 'auto:good',
    fetch_format: 'auto'
  };
  
  return cloudinary.url(publicId, {
    resource_type: 'video',
    ...defaultTransformations,
    ...transformations
  });
};