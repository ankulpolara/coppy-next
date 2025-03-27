import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function ensureModelsLoaded() {
  if (modelsLoaded) {
    return;
  }

  try {
    await Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]);
    modelsLoaded = true;
  } catch (error) {
    console.error('Error loading face detection models:', error);
    throw new Error('Failed to load face detection models');
  }
}