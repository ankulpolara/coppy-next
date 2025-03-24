import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/employees - Get all employees
export async function GET() {
  try {
    const employees = await query('SELECT id, name, email, department, created_at FROM employees');
    return NextResponse.json({ employees }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

// POST /api/employees - Add a new employee
export async function POST(request: NextRequest) {
  try {
    const { name, email, department, faceDescriptor } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if employee with email already exists
    const existingEmployees = await query('SELECT id FROM employees WHERE email = ?', [email]);
    if ((existingEmployees as any[]).length > 0) {
      return NextResponse.json({ error: 'Employee with this email already exists' }, { status: 409 });
    }

    // Insert new employee
    const result = await query(
      'INSERT INTO employees (name, email, department, face_descriptor) VALUES (?, ?, ?, ?)',
      [name, email, department, faceDescriptor]
    );

    return NextResponse.json({ 
      message: 'Employee added successfully',
      employeeId: (result as any).insertId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json({ error: 'Failed to add employee' }, { status: 500 });
  }
}