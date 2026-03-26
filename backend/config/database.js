// server/config/database.js
import mysql from 'mysql2/promise'
import 'dotenv/config'

// ── Pool de conexiones ────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:    parseInt(  process.env.DB_PORT     || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'civicview_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '-05:00',           // America/Bogota
  charset:            'utf8mb4',
  connectTimeout:     10_000,
})

// ── Test de conexión al iniciar ───────────────────────────────────────────────
export async function testConnection() {
  try {
    const conn = await pool.getConnection()
    await conn.query('SELECT 1')
    conn.release()
    console.log('✅ MySQL conectado correctamente')
    return true
  } catch (err) {
    console.error('❌ Error conectando a MySQL:', err.message)
    console.warn('⚠️  El servidor continuará sin base de datos (solo caché en memoria)')
    return false
  }
}

// ── Helper: ejecutar query con manejo de errores ──────────────────────────────
export async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (err) {
    console.error('[DB Error]', err.message, '| SQL:', sql.substring(0, 80))
    throw err
  }
}

// ── Helper: obtener un único registro ────────────────────────────────────────
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params)
  return rows[0] || null
}

// ── Verificar si la DB está disponible ───────────────────────────────────────
export async function isDBAvailable() {
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}

export default pool