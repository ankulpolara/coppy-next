'use client';

import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { detectFaces, descriptorToString } from '@/lib/faceDetection';

interface WebcamCaptureProps {
  onCapture?: (faceDescriptor: string | null) => void;
  onIdentify?: (employeeId: number) => void;
  mode: 'register' | 'identify';
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onIdentify, mode }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [facesDetected, setFacesDetected] = useState(0);
  
  // Handle capture button click
  const handleCapture = async () => {
    if (!webcamRef.current) return;
    
    setIsCapturing(true);
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        toast.error('Failed to capture image');
        return;
      }
      
      // Create an image element from the screenshot
      const img = new Image();
      img.src = imageSrc;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Detect faces in the captured image
      const detectedFaces = await detectFaces(img);
      setFacesDetected(detectedFaces.length);
      
      if (detectedFaces.length === 0) {
        toast.warning('No face detected. Please try again.');
        return;
      }
      
      if (detectedFaces.length > 1) {
        toast.warning('Multiple faces detected. Please ensure only one person is in frame.');
        return;
      }
      
      // Get the face descriptor
      const faceDescriptor = detectedFaces[0].descriptor;
      
      if (mode === 'register') {
        // For registration, we just pass the descriptor back
        if (onCapture) {
          onCapture(descriptorToString(faceDescriptor));
        }
        toast.success('Face captured successfully!');
      } else if (mode === 'identify') {
        // For identification, we need to send the descriptor to the server
        // to find a matching employee
        try {
          const response = await fetch('/api/employees/identify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ faceDescriptor: descriptorToString(faceDescriptor) }),
          });
          
          const data = await response.json();
          
          if (response.ok && data.employeeId) {
            if (onIdentify) {
              onIdentify(data.employeeId);
            }
            toast.success(`Identified as ${data.name}`);
          } else {
            toast.error(data.error || 'Failed to identify face');
          }
        } catch (error) {
          console.error('Error identifying face:', error);
          toast.error('Error identifying face. Please try again.');
        }
      }
      
      // Increment capture count for UI feedback
      setCaptureCount(prev => prev + 1);
      
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.error('Error processing image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 w-full max-w-md">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: 'user',
          }}
          className="w-full"
        />
        {isCapturing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-pulse text-white font-bold">Processing...</div>
          </div>
        )}
      </div>
      
      <button
        onClick={handleCapture}
        disabled={isCapturing}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
      >
        {isCapturing ? 'Processing...' : mode === 'register' ? 'Capture Face' : 'Identify Face'}
      </button>
      
      {facesDetected > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {facesDetected === 1 
            ? 'Face detected successfully!' 
            : `${facesDetected} faces detected. Please ensure only one person is in frame.`}
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;