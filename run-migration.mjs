#!/usr/bin/env node

import postgres from 'postgres';

const DATABASE_URL = 'postgresql://ibzndb:t7pmmdsqaqstu42t@72.60.136.77:5434/ibzndb';

const sql = postgres(DATABASE_URL);

async function runMigration() {
  console.log('🚀 Iniciando migration: Add participant_id to payments');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // 1. Adicionar coluna participant_id
    console.log('\n📝 Passo 1: Adicionando coluna participant_id...');
    await sql`
      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS participant_id integer
    `;
    console.log('✅ Coluna participant_id adicionada');

    // 2. Tornar user_id nullable
    console.log('\n📝 Passo 2: Tornando user_id nullable...');
    await sql`
      ALTER TABLE payments
      ALTER COLUMN user_id DROP NOT NULL
    `;
    console.log('✅ Coluna user_id agora é nullable');

    // 3. Adicionar foreign key para participants
    console.log('\n📝 Passo 3: Adicionando foreign key para participants...');

    // Verificar se a constraint já existe
    const existingConstraint = await sql`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'payments'
      AND constraint_name = 'payments_participant_id_fk'
    `;

    if (existingConstraint.length === 0) {
      await sql`
        ALTER TABLE payments
        ADD CONSTRAINT payments_participant_id_fk
        FOREIGN KEY (participant_id)
        REFERENCES participants(id)
        ON DELETE CASCADE
      `;
      console.log('✅ Foreign key adicionada');
    } else {
      console.log('ℹ️  Foreign key já existe');
    }

    // 4. Verificar estrutura final
    console.log('\n📊 Verificando estrutura da tabela payments...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'payments'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 Colunas da tabela payments:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration concluída com sucesso!');
    console.log('\n📌 Próximos passos:');
    console.log('  1. Reinicie o servidor de desenvolvimento');
    console.log('  2. Atualize o frontend para usar participantId');

  } catch (error) {
    console.error('\n❌ Erro ao executar migration:', error);
    throw error;
  } finally {
    await sql.end();
    console.log('\n🔌 Conexão com o banco de dados fechada');
  }
}

runMigration().catch(err => {
  console.error('Migration falhou:', err);
  process.exit(1);
});
