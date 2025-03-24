import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Models to download
const MODELS = [
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2'
];

// Base URL for face-api.js models
const MODELS_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

// Function to download a file
async function downloadFile(url: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create directory if it doesn't exist
    const dir = path.dirname(destination);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Skip if file already exists
    if (fs.existsSync(destination)) {
      console.log(`File already exists: ${destination}`);
      resolve();
      return;
    }
    
    const file = fs.createWriteStream(destination);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// GET /api/init - Initialize the application
export async function GET(request: NextRequest) {
  try {
    // Initialize database
    await initDatabase();
    
    // Download face-api.js models
    const modelsDir = path.join(process.cwd(), 'public', 'models');
    
    // Download models in parallel
    await Promise.all(MODELS.map(model => {
      const url = `${MODELS_URL}${model}`;
      const destination = path.join(modelsDir, model);
      return downloadFile(url, destination);
    }));
    
    return NextResponse.json({ 
      message: 'Application initialized successfully',
      database: 'Initialized',
      models: 'Downloaded'
    }, { status: 200 });
  } catch (error) {
    console.error('Error initializing application:', error);
    return NextResponse.json({ error: 'Failed to initialize application' }, { status: 500 });
  }
}