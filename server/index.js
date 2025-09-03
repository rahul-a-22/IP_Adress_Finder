import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Setup cache
const cache = new NodeCache({
  stdTTL: process.env.CACHE_DURATION || 3600, // Default: 1 hour in seconds
  checkperiod: 120 // Check for expired keys every 2 minutes
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiting to all requests
app.use(limiter);

// Caching middleware
const cacheMiddleware = (req, res, next) => {
  const ip = req.params.ip || 'self';
  const cacheKey = `ip-${ip}`;
  
  // Check if data exists in cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for IP: ${ip}`);
    return res.json(cachedData);
  }
  
  console.log(`Cache miss for IP: ${ip}`);
  next();
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'IP Address Finder API' });
});

// IP Lookup route with ipapi.co
app.get('/api/lookup/:ip?', cacheMiddleware, async (req, res) => {
  try {
    const ip = req.params.ip || '';
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'IP-Finder-App/1.0',
      },
      // Add API key if available and not empty
      params: process.env.IPAPI_KEY && process.env.IPAPI_KEY.trim() !== '' ? { key: process.env.IPAPI_KEY } : {}
    });
    
    // Store in cache
    const cacheKey = `ip-${ip || 'self'}`;
    cache.set(cacheKey, response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching IP details:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch IP details',
      message: error.response?.data?.message || error.message
    });
  }
});

// IP Lookup route with ipinfo.io (alternative)
app.get('/api/lookup-alt/:ip?', cacheMiddleware, async (req, res) => {
  try {
    const ip = req.params.ip || '';
    const url = `https://ipinfo.io/${ip ? ip : ''}/json`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'IP-Finder-App/1.0',
      },
      // Add token if available and not empty
      params: process.env.IPINFO_TOKEN && process.env.IPINFO_TOKEN.trim() !== '' ? { token: process.env.IPINFO_TOKEN } : {}
    });
    
    // Store in cache
    const cacheKey = `ip-${ip || 'self'}`;
    cache.set(cacheKey, response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching IP details:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch IP details',
      message: error.response?.data?.message || error.message
    });
  }
});

// Clear cache route (for testing/admin purposes)
app.post('/api/clear-cache', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});