import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import moment from 'moment-timezone';

// GET /api/attendance - Get all attendance records
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const employeeId = searchParams.get('employeeId');
    
    let sql = `
      SELECT a.*, e.name, e.email, e.department 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.id
    `;
    const params = [];
    
    // Add filters if provided
    const conditions = [];
    
    if (start && end) {
      conditions.push('a.date BETWEEN ? AND ?');
      params.push(start, end);
    }
    
    if (employeeId) {
      conditions.push('a.employee_id = ?');
      params.push(employeeId);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY a.date DESC, e.name ASC';
    
    const attendanceRecords = await query(sql, params);
    return NextResponse.json({ attendanceRecords }, { status: 200 });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance records' }, { status: 500 });
  }
}

// POST /api/attendance - Record check-in or check-out
export async function POST(request: NextRequest) {
  try {
    const { employeeId, action, timestamp } = await request.json();
    const parsedTimestamp = moment.tz(timestamp, '+05:30').format('YYYY-MM-DD HH:mm:ss');
    // console.log('Request body................................:', parsedTimestamp ,timestamp);
    
    // Validate required fields
    if (!employeeId || !action || !timestamp) {
      return NextResponse.json({ error: 'Employee ID, timestamp and action are required' }, { status: 400 });
    }
    
    // Check if employee exists
    const employees = await query('SELECT id FROM employees WHERE id = ?', [employeeId]);
    if ((employees as any[]).length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = parsedTimestamp;
    console.log("currentTime", currentTime);
    
    if (action === 'check-in') {
      // Check if already checked in today
      const existingRecord = await query(
        'SELECT id, check_in, check_out FROM attendance WHERE employee_id = ? AND date = ? ORDER BY id DESC LIMIT 1',
        [employeeId, currentDate]
      );
      
      if ((existingRecord as any[]).length > 0) {
        // If last record has both check-in and check-out, create a new record
        if ((existingRecord as any[])[0].check_in && (existingRecord as any[])[0].check_out) {
          await query(
            'INSERT INTO attendance (employee_id, check_in, date) VALUES (?, ?, ?)',
            [employeeId, currentTime, currentDate]
          );
          return NextResponse.json({ message: 'New check-in recorded successfully' }, { status: 201 });
        }
        
        // If already checked in but not checked out, return the existing record
        if ((existingRecord as any[])[0].check_in && !(existingRecord as any[])[0].check_out) {
          return NextResponse.json({
            message: 'Employee already has an active check-in',
            attendance: (existingRecord as any[])[0]
          }, { status: 200 });
        }
        
        // If record exists but no check-in (rare case), update it
        await query(
          'UPDATE attendance SET check_in = ? WHERE id = ?',
          [currentTime, (existingRecord as any[])[0].id]
        );
      } else {
        // Create new attendance record with check-in
        await query(
          'INSERT INTO attendance (employee_id, check_in, date) VALUES (?, ?, ?)',
          [employeeId, currentTime, currentDate]
        );
      }
      
      return NextResponse.json({ message: 'Check-in recorded successfully' }, { status: 201 });
    } else if (action === 'check-out') {
      // Check if already checked in today
      const existingRecord = await query(
        'SELECT id, check_in, check_out FROM attendance WHERE employee_id = ? AND date = ? ORDER BY id DESC LIMIT 1',
        [employeeId, currentDate]
      );
      
      if ((existingRecord as any[]).length === 0 || !(existingRecord as any[])[0].check_in) {
        return NextResponse.json({ error: 'Cannot check out without checking in first' }, { status: 400 });
      }
      
      // If already checked out, return the existing record
      if ((existingRecord as any[])[0].check_out) {
        return NextResponse.json({
          message: 'Employee already checked out today',
          attendance: (existingRecord as any[])[0]
        }, { status: 200 });
      }
      
      // Update attendance record with check-out
      await query(
        'UPDATE attendance SET check_out = ? WHERE id = ?',
        [currentTime, (existingRecord as any[])[0].id]
      );
      
      return NextResponse.json({ message: 'Check-out recorded successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "check-in" or "check-out"' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}