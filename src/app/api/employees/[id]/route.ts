import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/employees/[id] - Get employee by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }
    const employees = await query('SELECT id, name, email, department, created_at FROM employees WHERE id = ?', [id]);
    
    if ((employees as any[]).length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    return NextResponse.json({ employee: (employees as any[])[0] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { name, email, department, faceDescriptor } = await request.json();
    
    // Check if employee exists
    const existingEmployees = await query('SELECT id FROM employees WHERE id = ?', [id]);
    if ((existingEmployees as any[]).length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    // Update employee
    let updateQuery = 'UPDATE employees SET ';
    const updateParams = [];
    
    if (name) {
      updateQuery += 'name = ?, ';
      updateParams.push(name);
    }
    
    if (email) {
      updateQuery += 'email = ?, ';
      updateParams.push(email);
    }
    
    if (department) {
      updateQuery += 'department = ?, ';
      updateParams.push(department);
    }
    
    if (faceDescriptor) {
      updateQuery += 'face_descriptor = ?, ';
      updateParams.push(faceDescriptor);
    }
    
    // Remove trailing comma and space
    updateQuery = updateQuery.slice(0, -2);
    
    // Add WHERE clause
    updateQuery += ' WHERE id = ?';
    updateParams.push(id);
    
    await query(updateQuery, updateParams);
    
    return NextResponse.json({ message: 'Employee updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

// DELETE /api/employees/[id] - Delete employee
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // Check if employee exists
    const existingEmployees = await query('SELECT id FROM employees WHERE id = ?', [id]);
    if ((existingEmployees as any[]).length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    // First delete all attendance records for this employee
    await query('DELETE FROM attendance WHERE employee_id = ?', [id]);
    
    // Then delete the employee
    await query('DELETE FROM employees WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Employee and related records deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}