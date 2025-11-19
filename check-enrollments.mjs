#!/usr/bin/env node

import postgres from 'postgres';

const DATABASE_URL = 'postgresql://ibzndb:t7pmmdsqaqstu42t@72.60.136.77:5434/ibzndb';
const sql = postgres(DATABASE_URL);

async function checkTable() {
  try {
    console.log('📊 Verificando estrutura da tabela course_enrollments...\n');

    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'course_enrollments'
      ORDER BY ordinal_position
    `;

    console.log('📋 Colunas encontradas:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    console.log('\n📌 Foreign keys:');
    const fks = await sql`
      SELECT constraint_name, table_name
      FROM information_schema.table_constraints
      WHERE table_name = 'course_enrollments'
      AND constraint_type = 'FOREIGN KEY'
    `;

    fks.forEach(fk => {
      console.log(`  - ${fk.constraint_name}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sql.end();
  }
}

checkTable();
