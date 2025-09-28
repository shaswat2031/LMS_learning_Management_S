import rateLimit from 'express-rate-limit';

// Default rate limiter
export const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiter for sensitive operations
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests for this operation, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 uploads per hour
  message: {
    status: 'error',
    message: 'Upload limit exceeded, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth rate limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // don't count successful requests
});

// Search rate limiter
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 search requests per minute
  message: {
    status: 'error',
    message: 'Search rate limit exceeded, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Video streaming rate limiter
export const videoLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // allow more requests for video streaming
  message: {
    status: 'error',
    message: 'Video access rate limit exceeded.'
  },
  standardHeaders: true,
  legacyHeaders: false
});