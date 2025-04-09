// api/index.js
import express from 'express';
import mongoose from 'mongoose';
import { createServer } from '@vercel/node';
import path from 'path';
import { fileURLToPath } from 'url';

// Enhanced error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuration with fallbacks
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// Serverless-optimized MongoDB connection
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 20000,
  maxPoolSize: 2,
};

let conn = null;

const connectDB = async () => {
  if (conn) return conn;
  
  try {
    conn = await mongoose.createConnection('mongodb+srv://Adesinaola1234:5MBQFimZoV8Xe9ER@cluster0.jobmt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', mongoOptions);
    console.log('MongoDB connection established');
    
    // Connection event handlers
    conn.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      conn = null;
    });
    
    conn.on('disconnected', () => {
      console.log('MongoDB disconnected');
      conn = null;
    });

    return conn;
  } catch (err) {
    console.error('Initial connection failed:', err);
    conn = null;
    throw err;
  }
};

// Schema definition
const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Main route with connection verification
app.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    const Item = db.model('Item', itemSchema);
    const items = await Item.find().lean().maxTimeMS(5000);
    res.render('index', { items });
  } catch (err) {
    console.error('Root route error:', err);
    res.status(500).render('error', { 
      message: 'Service unavailable. Please try again later.'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Application error:', err);
  res.status(500).render('error', {
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Serverless export
export default createServer(app);
