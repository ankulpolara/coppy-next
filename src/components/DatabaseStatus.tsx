import React, { useState, useEffect } from 'react';

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking database connection...');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/db');
        const data = await response.json();
        setStatus(data.status);
      } catch (error) {
        console.error('Error checking database status:', error);
        setStatus('Database connection failed');
      }
    };

    fetchStatus();
  }, []);

  return (
    <div className="status-message">
      {status}
    </div>
  );
};

export default DatabaseStatus;