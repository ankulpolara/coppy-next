import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { stringToDescriptor, compareFaces } from '@/lib/faceDetection';

// POST /api/employees/identify - Identify an employee by face descriptor
export async function POST(request: NextRequest) {
  try {
    const { faceDescriptor } = await request.json();
    
    if (!faceDescriptor) {
      return NextResponse.json({ error: 'Face descriptor is required' }, { status: 400 });
    }
    
    // Get all employees with face descriptors
    const employees = await query('SELECT id, name, face_descriptor FROM employees WHERE face_descriptor IS NOT NULL');
    
    if ((employees as any[]).length === 0) {
      return NextResponse.json({ error: 'No employees with face data found' }, { status: 404 });
    }
    
    // Convert the input descriptor to Float32Array
    const inputDescriptor = stringToDescriptor(faceDescriptor);
    
    // Prepare stored descriptors for comparison
    const storedDescriptors = (employees as any[]).map(emp => {
      return {
        id: emp.id,
        name: emp.name,
        descriptor: stringToDescriptor(emp.face_descriptor)
      };
    });
    
    // Find the best match
    let bestMatch = null;
    let lowestDistance = 0.6; // Threshold for face recognition
    
    for (const emp of storedDescriptors) {
      // Create a single-element array for compareFaces function
      const result = await compareFaces(inputDescriptor, [emp.descriptor]);
      
      if (result.match && result.distance < lowestDistance) {
        lowestDistance = result.distance;
        bestMatch = emp;
      }
    }
    
    if (bestMatch) {
      return NextResponse.json({
        employeeId: bestMatch.id,
        name: bestMatch.name,
        confidence: 1 - lowestDistance // Convert distance to confidence score
      }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'No matching employee found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error identifying employee:', error);
    return NextResponse.json({ error: 'Failed to identify employee' }, { status: 500 });
  }
}