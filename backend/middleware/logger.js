import morgan from 'morgan';

// Custom token for user ID
morgan.token('userId', (req) => {
  return req.user?.clerkId || req.auth?.userId || 'anonymous';
});

// Custom token for request duration in ms
morgan.token('duration', (req, res) => {
  if (!req._startTime) return '-';
  const duration = Date.now() - req._startTime;
  return `${duration}ms`;
});

// Development logging format
export const devLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms :userId'
);

// Production logging format
export const prodLogger = morgan(
  ':remote-addr - :userId [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :duration'
);

// API access logger
export const apiLogger = morgan(
  ':method :url :status :res[content-length] :duration :userId :remote-addr',
  {
    skip: (req, res) => {
      // Skip logging for health checks and static files
      return req.url === '/api/health' || req.url.includes('/static/');
    }
  }
);

// Error logger
export const errorLogger = morgan(
  ':method :url :status :res[content-length] :duration :userId :remote-addr ":user-agent"',
  {
    skip: (req, res) => res.statusCode < 400
  }
);

// Custom request tracking middleware
export const requestTracker = (req, res, next) => {
  req._startTime = Date.now();
  req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Add request ID to response headers
  res.set('X-Request-ID', req.requestId);
  
  // Log request start in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Request ID: ${req.requestId}`);
  }
  
  next();
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Set security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  });
  
  next();
};

// Response time tracker
export const responseTimeTracker = (req, res, next) => {
  const startTime = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.url} - ${duration.toFixed(2)}ms`);
    }
    
    // Add timing header
    res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
  });
  
  next();
};