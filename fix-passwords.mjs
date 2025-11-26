import pg from 'pg';
import bcryptjs from 'bcryptjs';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixPasswords() {
  try {
    console.log(' Verificando usuários...\n');
    
    const users = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, a.id as account_id, a.password
      FROM "user" u
      LEFT JOIN "account" a ON a."userId" = u.id AND a."providerId" = 'credential'
      WHERE u.role IN ('admin', 'manager')
      ORDER BY u.role, u.email
    `);

    if (users.rows.length === 0) {
      console.log('❌ Nenhum usuário encontrado\n');
      return;
    }

    console.log(` Encontrados ${users.rows.length} usuários:\n`);
    
    for (const user of users.rows) {
      console.log(` ${user.role.toUpperCase()}: ${user.name} (${user.email})`);
      console.log(`   Account ID: ${user.account_id || '❌ SEM CONTA'}`);
      console.log(`   Password: ${user.password ? '✅ Existe' : '❌ Vazia'}\n`);
    }

    console.log('\n🔧 Resetando TODAS as senhas para: "admin123"\n');

    for (const user of users.rows) {
      const hashedPassword = await bcryptjs.hash('admin123', 10);

      if (!user.account_id) {
        // Criar conta se não existir
        const accountId = crypto.randomUUID();
        await pool.query(`
          INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
          VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())
        `, [accountId, user.email, user.id, hashedPassword]);
        console.log(`✅ Conta criada para ${user.email}`);
      } else {
        // Atualizar conta existente
        await pool.query(`
          UPDATE "account"
          SET password = $1, "updatedAt" = NOW()
          WHERE id = $2
        `, [hashedPassword, user.account_id]);
        console.log(`✅ Senha atualizada para ${user.email}`);
      }
    }

    console.log('\n✅ CONCLUÍDO! Todas as senhas foram resetadas para: admin123\n');
    console.log('⚠️  IMPORTANTE: Altere as senhas após fazer login!\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

fixPasswords();
