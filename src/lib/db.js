import pg from 'pg';

const { Pool } = pg;

let pool;

function getPool() {
  if (!pool) {
    const isInternal = process.env.DATABASE_URL?.includes('railway.internal');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isInternal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function query(text, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS commissions (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS policies (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS life_os (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export async function getAll(table) {
  const result = await query(
    `SELECT id, data, created_at FROM ${table} WHERE (data->>'deleted_at') IS NULL ORDER BY created_at DESC`
  );
  return result.rows.map((r) => ({ id: r.id, ...r.data, created_at: r.created_at }));
}

export async function getById(table, id) {
  const result = await query(
    `SELECT id, data, created_at FROM ${table} WHERE id = $1 AND (data->>'deleted_at') IS NULL`,
    [id]
  );
  if (result.rows.length === 0) return null;
  const r = result.rows[0];
  return { id: r.id, ...r.data, created_at: r.created_at };
}

export async function upsert(table, id, data) {
  await query(
    `INSERT INTO ${table} (id, data) VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET data = $2`,
    [id, JSON.stringify(data)]
  );
}

export async function softDelete(table, id) {
  const existing = await getById(table, id);
  if (!existing) return null;
  const { created_at, ...data } = existing;
  data.deleted_at = new Date().toISOString();
  await upsert(table, id, data);
  return data;
}

export async function getFiltered(table, filterFn) {
  const all = await getAll(table);
  return all.filter(filterFn);
}
