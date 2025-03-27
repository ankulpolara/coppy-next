'use client';

import DashboardClient from '@/components/DashboardClient';
import React from 'react';
import DatabaseStatus from '@/components/DatabaseStatus';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to the Attendance System</h1>
      <DatabaseStatus />
      <DashboardClient />
    </div>
  );
};

export default HomePage;
