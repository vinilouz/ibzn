import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Conectar ao banco de dados
const sql = postgres('postgresql://ibzndb:t7pmmdsqaqstu42t@72.60.136.77:5434/ibzndb');

async function migrate() {
  try {
    console.log('🔄 Executando migration: Add participant_id to payments...');

    // Ler o arquivo SQL
    const migrationSQL = readFileSync(
      join(__dirname, 'drizzle', '0004_add_participant_id_to_payments.sql'),
      'utf-8'
    );

    // Executar cada comando SQL separadamente
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--'));

    for (const command of commands) {
      if (command) {
        console.log(`Executando: ${command.substring(0, 50)}...`);
        await sql.unsafe(command);
      }
    }

    console.log('✅ Migration executada com sucesso!');

    // Verificar se a coluna foi criada
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'payments' AND column_name = 'participant_id'
    `;

    if (result.length > 0) {
      console.log('✅ Coluna participant_id criada:', result[0]);
    } else {
      console.log('⚠️  Coluna participant_id não encontrada');
    }

  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

migrate();
