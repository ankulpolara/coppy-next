'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO, differenceInHours, differenceInMinutes, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface AttendanceRecord {
  id: number;
  employee_id: number;
  name: string;
  check_in: string;
  check_out: string;
  date: string;
}

interface EmployeeStats {
  totalHours: number;
  averageHoursPerDay: number;
  daysPresent: number;
}

const Reports: React.FC = () => {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    return {
      start: format(today, 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd')
    };
  });
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch attendance data
        const attendanceResponse = await fetch(
          `/api/attendance?start=${dateRange.start}&end=${dateRange.end}`
        );
        const attendanceResult = await attendanceResponse.json();
        setAttendanceData(attendanceResult.attendanceRecords || []);

        // Fetch total employees count
        const employeesResponse = await fetch('/api/employees');
        const employeesResult = await employeesResponse.json();
        setTotalEmployees(employeesResult.employees?.length || 0);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const calculateWorkingHours = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    const checkInTime = parseISO(checkIn);
    const checkOutTime = parseISO(checkOut);
    const hours = differenceInHours(checkOutTime, checkInTime);
    const minutes = differenceInMinutes(checkOutTime, checkInTime) % 60;
    return Number((hours + minutes / 60).toFixed(2));
  };

  const calculateEmployeeStats = (employeeId: number): EmployeeStats => {
    const employeeRecords = attendanceData.filter(record => record.employee_id === employeeId);
    const totalHours = employeeRecords.reduce((sum, record) => {
      return sum + calculateWorkingHours(record.check_in, record.check_out);
    }, 0);
    
    return {
      totalHours: Number(totalHours.toFixed(2)),
      averageHoursPerDay: Number((totalHours / employeeRecords.length).toFixed(2)) || 0,
      daysPresent: employeeRecords.length
    };
  };

  const handleViewChange = (newView: 'daily' | 'weekly' | 'monthly') => {
    const today = new Date();
    let start: Date, end: Date;

    switch (newView) {
      case 'weekly':
        start = startOfWeek(today);
        end = endOfWeek(today);
        break;
      case 'monthly':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      default: // daily
        start = today;
        end = today;
    }

    setView(newView);
    setDateRange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    });
  };

  const getAttendanceSummary = () => {
    const totalPresent = new Set(attendanceData.map(record => record.employee_id)).size;
    const attendancePercentage = ((totalPresent / totalEmployees) * 100).toFixed(1);

    return {
      totalPresent,
      attendancePercentage,
      averageHours: (attendanceData.reduce((sum, record) => {
        return sum + calculateWorkingHours(record.check_in, record.check_out);
      }, 0) / totalPresent).toFixed(2)
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const summary = getAttendanceSummary();
console.log( "attendance data",attendanceData)
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Reports</h2>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => handleViewChange('daily')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${view === 'daily' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600'}`}
          >
            Daily
          </button>
          <button
            onClick={() => handleViewChange('weekly')}
            className={`px-4 py-2 text-sm font-medium ${view === 'weekly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => handleViewChange('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${view === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600'}`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Total Employees</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{totalEmployees}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Present Today</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-300">
            {summary.totalPresent} ({summary.attendancePercentage}%)
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Average Hours</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">{summary.averageHours}h</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hours Worked</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {attendanceData.map((record, index) => {
              const workingHours = calculateWorkingHours(record.check_in, record.check_out);
              return (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{record?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {format(parseISO(record.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {record.check_in ? format(parseISO(record.check_in), 'hh:mm a') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {record.check_out ? format(parseISO(record.check_out), 'hh:mm a') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {workingHours > 0 ? `${workingHours}h` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;