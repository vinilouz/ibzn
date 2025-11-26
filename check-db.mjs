import postgres from 'postgres';

const sql = postgres('postgres://root:mysecretpassword@localhost:5432/local');

try {
    // Listar todas as tabelas
    const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;

    console.log('📊 Tabelas encontradas:');
    console.log(tables);

    if (tables.length === 0) {
        console.log('\n⚠️  Banco de dados está VAZIO - sem tabelas!');
    } else {
        console.log('\n✅ Banco tem', tables.length, 'tabela(s)');

        // Contar registros em cada tabela
        for (const table of tables) {
            const count = await sql`SELECT COUNT(*) FROM ${sql(table.table_name)}`;
            console.log(`  - ${table.table_name}: ${count[0].count} registros`);
        }
    }

} catch (error) {
    console.error('❌ Erro:', error.message);
} finally {
    await sql.end();
}
