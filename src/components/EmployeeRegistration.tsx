'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import WebcamCapture from './WebcamCapture';

interface EmployeeRegistrationProps {
  onSuccess?: () => void;
}

const EmployeeRegistration: React.FC<EmployeeRegistrationProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCapture = (descriptor: string | null) => {
    setFaceDescriptor(descriptor);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast.error('Name and email are required');
      return;
    }
    
    if (!faceDescriptor) {
      toast.error('Please capture a face image');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          department,
          faceDescriptor,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Employee registered successfully!');
        // Reset form
        setName('');
        setEmail('');
        setDepartment('');
        setFaceDescriptor(null);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(data.error || 'Failed to register employee');
      }
    } catch (error) {
      console.error('Error registering employee:', error);
      toast.error('Error registering employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Register New Employee</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <input
                type="text"
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Face Capture *
            </label>
            <WebcamCapture onCapture={handleCapture} mode="register" />
            {faceDescriptor && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                Face captured successfully!
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !faceDescriptor}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Registering...' : 'Register Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeRegistration;