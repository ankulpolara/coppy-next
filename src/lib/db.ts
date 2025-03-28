import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'attendance_system',
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to execute SQL queries
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Initialize database tables if they don't exist
export async function initDatabase() {
  console.log('Initializing database   CALLING  ........');
  
  try {
    // Create employees table
    await query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        department VARCHAR(100),
        face_descriptor TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create attendance table
    await query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        check_in DATETIME,
        check_out DATETIME,
        date DATE NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export async function checkDatabaseConnection(): Promise<string> {
  try {
    await initDatabase();
    return 'Database connection successful';
  } catch (error) {
    return 'Database connection failed';
  }
}