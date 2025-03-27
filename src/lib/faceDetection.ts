import * as faceapi from 'face-api.js';
import { ensureModelsLoaded } from './modelCache';

export async function loadModels() {
  await ensureModelsLoaded();
}

export async function detectFaces(img: HTMLImageElement) {
  try {
    await loadModels();
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    return detections;
  } catch (error) {
    console.error('Error in face detection:', error);
    throw new Error('Failed to detect faces');
  }
}

export function descriptorToString(descriptor: Float32Array): string {
  return Array.from(descriptor).join(',');
}

export function stringToDescriptor(str: string): Float32Array {
  const values = str.split(',').map(Number);
  return new Float32Array(values);
}

export { stringToDescriptor }

export async function compareFaces(descriptor1: Float32Array, descriptor2: Float32Array[]): Promise<{ match: boolean; distance: number }> {
  const distances = descriptor2.map(d => faceapi.euclideanDistance(descriptor1, d));
  const minDistance = Math.min(...distances);
  return { match: minDistance < 0.6, distance: minDistance };
}