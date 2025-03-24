import * as faceapi from 'face-api.js';

// Flag to track if models are loaded
let modelsLoaded = false;

// Load face detection models
export async function loadModels() {
  if (modelsLoaded) return;
  
  try {
    // Models path - adjust if needed based on your public folder structure
    const MODEL_URL = '/models';
    
    // Load required face-api.js models
    await Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
    ]);
    
    modelsLoaded = true;
    console.log('Face detection models loaded successfully');
  } catch (error) {
    console.error('Error loading face detection models:', error);
    throw new Error('Failed to load face detection models');
  }
}

// Detect faces in an image and return face descriptors
export async function detectFaces(imageElement: HTMLImageElement | HTMLVideoElement) {
  if (!modelsLoaded) {
    await loadModels();
  }
  
  try {
    // Detect all faces and generate face descriptors
    const detections = await faceapi
      .detectAllFaces(imageElement)
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    return detections;
  } catch (error) {
    console.error('Error detecting faces:', error);
    throw new Error('Failed to detect faces');
  }
}

// Compare face with stored face descriptors
export async function compareFaces(faceDescriptor: Float32Array, storedDescriptors: Float32Array[]) {
  try {
    // Create face matcher with stored descriptors
    const labeledDescriptors = storedDescriptors.map((descriptor, i) => {
      return new faceapi.LabeledFaceDescriptors(
        `employee_${i}`,
        [new Float32Array(descriptor)]
      );
    });
    
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6); // 0.6 is the distance threshold
    
    // Find best match
    const bestMatch = faceMatcher.findBestMatch(faceDescriptor);
    
    return {
      match: bestMatch.label !== 'unknown',
      label: bestMatch.label,
      distance: bestMatch.distance
    };
  } catch (error) {
    console.error('Error comparing faces:', error);
    throw new Error('Failed to compare faces');
  }
}

// Convert face descriptor to string for storage
export function descriptorToString(descriptor: Float32Array): string {
  return JSON.stringify(Array.from(descriptor));
}

// Convert string back to face descriptor
export function stringToDescriptor(str: string): Float32Array {
  return new Float32Array(JSON.parse(str));
}