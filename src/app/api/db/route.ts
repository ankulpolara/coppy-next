import { NextResponse } from 'next/server';
import { initDatabase, checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  try {
    await initDatabase();
    const status = await checkDatabaseConnection();
    return NextResponse.json({ status });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}