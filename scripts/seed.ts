import pool from '../lib/db';
import { hash } from 'bcrypt';

async function seed() {
  const client = await pool.connect();
  try {
    // Inserir administrador
    const hashed = await hash('admin123', 10);
    await client.query(
      `INSERT INTO utilizadores (nome, email, telefone, hash_senha, papel)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
      ['Administrador', 'admin@oficinalpn.com', '+244900000001', hashed, 'administrador']
    );

    // Inserir serviços e peças conforme desejado...
    console.log('Seed concluído');
  } finally {
    client.release();
  }
}

seed().catch(console.error);