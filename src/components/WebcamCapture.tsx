'use client';

import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { detectFaces, descriptorToString } from '@/lib/faceDetection';
import styles from '@/styles/WebcamCapture.module.css';

interface WebcamCaptureProps {
  onCapture?: (faceDescriptor: string | null) => void;
  onIdentify?: (employeeId: number) => void;
  mode: 'register' | 'identify';
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onIdentify, mode }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [facesDetected, setFacesDetected] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  useEffect(() => {
    let isActive = true;
    const detectFaceLoop = async () => {
      if (!webcamRef.current || isProcessing || !isCameraOn) return;
        
      setIsProcessing(true);
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc || !isActive) return;

        const img = new Image();
        img.src = imageSrc;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        const detectedFaces = await detectFaces(img);
        if (!isActive) return;
        
        setFacesDetected(detectedFaces.length);
        
        if (detectedFaces.length === 1 && !faceDetected && isCameraOn) {
          toast.info('Face detected in camera!');
          const faceDescriptor = detectedFaces[0].descriptor;
          
          if (mode === 'register' && onCapture) {
            toast.info('Processing face features...');
            onCapture(descriptorToString(faceDescriptor));
            setFaceDetected(true);
            setIsCameraOn(false);
            toast.success('Face registered successfully!');
          } else if (mode === 'identify') {
            try {
              toast.info('Starting face comparison...');
              const response = await fetch('/api/employees/identify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ faceDescriptor: descriptorToString(faceDescriptor) }),
              });
              
              toast.info('Analyzing database match...');
              const data = await response.json();
              
              if (response.ok && data.employeeId && onIdentify) {
                onIdentify(data.employeeId);
                setFaceDetected(true);
                setIsCameraOn(false);
                toast.success(`Match found! Welcome, ${data.name}!`);
              } else {
                toast.error('No matching face found in database');
              }
            } catch (error) {
              console.error('Error identifying face:', error);
              toast.error('Error during face matching process');
            }
          }
        }
      } catch (error) {
        console.error('Error in face detection loop:', error);
      } finally {
        if (isActive) {
          setIsProcessing(false);
          setTimeout(detectFaceLoop, 200);
        }
      }
    };
    
    if (isCameraOn) {
      detectFaceLoop();
    }

    return () => {
      isActive = false;
    };
  }, [onCapture, onIdentify, mode, isCameraOn]);
  
  const handleCapture = async () => {
    if (!webcamRef.current || isCapturing) return;
    
    setIsCapturing(true);
    setFaceDetected(false); // Reset face detection state
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        toast.error('Failed to capture image');
        return;
      }
      
      const img = new Image();
      img.src = imageSrc;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
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
      
      const faceDescriptor = detectedFaces[0].descriptor;
      
      if (mode === 'register') {
        if (onCapture) {
          onCapture(descriptorToString(faceDescriptor));
          toast.success('Face captured successfully!');
          setFaceDetected(true);
          setIsCameraOn(false);
        }
      } else if (mode === 'identify') {
        try {
          toast.info('Comparing with database...');
          const response = await fetch('/api/employees/identify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ faceDescriptor: descriptorToString(faceDescriptor) }),
          });
          
          const data = await response.json();
          
          if (response.ok && data.employeeId && onIdentify) {
            onIdentify(data.employeeId);
            setFaceDetected(true);
            setIsCameraOn(false);
            toast.success(`Match found! Welcome, ${data.name}!`);
          } else {
            toast.error(data.error || 'No matching face found in database');
          }
        } catch (error) {
          console.error('Error identifying face:', error);
          toast.error('Error during face identification. Please try again.');
        }
      }
      
      setCaptureCount(prev => prev + 1);
      
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.error('Error processing image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };
  
  const handleRetry = () => {
    setFaceDetected(false);
    setIsCameraOn(true);
    setFacesDetected(0);
    setCaptureCount(0);
    setIsCapturing(false);
    setIsProcessing(false);
    toast.dismiss(); // Clear any existing toast messages
  };

  return (
    <div className={styles.webcamContainer}>
      {isCameraOn && (
        <>
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
          <div className={styles.processingOverlay}>
            <div className={styles.processingIndicator}>
              {isProcessing ? (
                <>
                  <div className={styles.statusMessage}>
                    {facesDetected === 0 && 'Looking for faces...'}
                    {facesDetected === 1 && 'Face detected! Processing...'}
                    {facesDetected > 1 && 'Multiple faces detected!'}
                  </div>
                  <div className={styles.processingSteps}>
                    {mode === 'identify' && (
                      <>
                        <div className={styles.step}>
                          <span>Face Detection</span>
                          <div className={`${styles.progressBar} ${facesDetected > 0 ? styles.completed : styles.active}`} />
                        </div>
                        <div className={styles.step}>
                          <span>Comparing with Database</span>
                          <div className={`${styles.progressBar} ${facesDetected === 1 ? styles.active : ''}`} />
                        </div>
                      </>
                    )}
                    {mode === 'register' && (
                      <>
                        <div className={styles.step}>
                          <span>Capturing Face Features</span>
                          <div className={`${styles.progressBar} ${facesDetected > 0 ? styles.completed : styles.active}`} />
                        </div>
                        <div className={styles.step}>
                          <span>Preparing for Registration</span>
                          <div className={`${styles.progressBar} ${facesDetected === 1 ? styles.active : ''}`} />
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </>
      )}
      {faceDetected && (
        <div className={styles.retryContainer}>
          <button
            onClick={handleRetry}
            className={styles.retryButton}
          >
            Click to Re-Capture Face
          </button>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;