'use client';

import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmployeeRegistration from './EmployeeRegistration';
import AttendanceMarking from './AttendanceMarking';
import EmployeeList from './EmployeeList';
import Reports from './Reports';

type TabType = 'attendance' | 'register' | 'employees' | 'reports';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Face Recognition Attendance System
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Securely track employee attendance using facial recognition
          </p>
        </header>
        
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`px-5 py-2.5 text-sm font-medium rounded-l-lg ${activeTab === 'attendance' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600'}`}
            >
              Mark Attendance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`px-5 py-2.5 text-sm font-medium ${activeTab === 'register' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600'}`}
            >
              Register Employee
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('employees')}
              className={`px-5 py-2.5 text-sm font-medium ${activeTab === 'employees' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600'}`}
            >
              Employees
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`px-5 py-2.5 text-sm font-medium rounded-r-lg ${activeTab === 'reports' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600'}`}
            >
              Reports
            </button>
          </div>
        </div>
        
        {activeTab === 'attendance' && <AttendanceMarking />}
        {activeTab === 'register' && (
          <EmployeeRegistration onSuccess={() => setActiveTab('attendance')} />
        )}
        {activeTab === 'employees' && <EmployeeList onAddNewClick={() => setActiveTab('register')} />}
        {activeTab === 'reports' && <Reports />}
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Dashboard;