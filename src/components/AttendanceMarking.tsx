'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import WebcamCapture from './WebcamCapture';

const AttendanceMarking: React.FC = () => {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [employeeName, setEmployeeName] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  
  const handleIdentify = async (id: number) => {
    setEmployeeId(id);
    
    try {
      // Fetch employee details
      const response = await fetch(`/api/employees/${id}`);
      const data = await response.json();
      
      if (response.ok && data.employee) {
        setEmployeeName(data.employee.name);
      } else {
        toast.error('Failed to fetch employee details');
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Error fetching employee details');
    }
  };
  
  const handleAttendanceAction = async () => {
    if (!employeeId) {
      toast.error('No employee identified');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const action = isCheckingIn ? 'check-in' : 'check-out';
      
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          action,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`${action === 'check-in' ? 'Check-in' : 'Check-out'} successful for ${employeeName}`);
        setAttendanceMarked(true);
      } else {
        toast.error(data.error || `Failed to ${action}`);
      }
    } catch (error) {
      console.error(`Error marking ${isCheckingIn ? 'check-in' : 'check-out'}:`, error);
      toast.error(`Error marking ${isCheckingIn ? 'check-in' : 'check-out'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setEmployeeId(null);
    setEmployeeName('');
    setAttendanceMarked(false);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {isCheckingIn ? 'Check-In' : 'Check-Out'}
      </h2>
      
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => {
              setIsCheckingIn(true);
              resetForm();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${isCheckingIn 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600'}`}
          >
            Check-In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCheckingIn(false);
              resetForm();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${!isCheckingIn 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600'}`}
          >
            Check-Out
          </button>
        </div>
      </div>
      
      {!employeeId && !attendanceMarked && (
        <div className="mb-6">
          <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
            Please look at the camera to identify yourself
          </p>
          <WebcamCapture mode="identify" onIdentify={handleIdentify} />
        </div>
      )}
      
      {employeeId && !attendanceMarked && (
        <div className="text-center space-y-6">
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-medium">Employee Identified</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white mt-2">{employeeName}</p>
          </div>
          
          <button
            onClick={handleAttendanceAction}
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting 
              ? 'Processing...' 
              : isCheckingIn 
                ? 'Confirm Check-In' 
                : 'Confirm Check-Out'}
          </button>
        </div>
      )}
      
      {attendanceMarked && (
        <div className="text-center space-y-6">
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-medium">
              {isCheckingIn ? 'Check-In' : 'Check-Out'} Successful
            </p>
            <p className="text-xl font-bold text-gray-800 dark:text-white mt-2">{employeeName}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Time: {new Date().toLocaleTimeString()}
            </p>
          </div>
          
          <button
            onClick={resetForm}
            className="px-6 py-3 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Mark Another Attendance
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceMarking;