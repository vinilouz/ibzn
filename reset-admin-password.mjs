import pg from 'pg';
import bcryptjs from 'bcryptjs';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function resetAdminPassword() {
  try {
    console.log('🔍 Conectando ao banco de dados...');
    
    // Buscar o usuário admin
    const userResult = await pool.query(`
      SELECT id, name, email, role FROM "user" WHERE role = 'admin' LIMIT 1
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ Nenhum usuário admin encontrado');
      console.log('📝 Criando novo usuário admin...');
      
      // Criar novo usuário admin
      const newUserId = crypto.randomUUID();
      const email = 'admin@ibzn.com';
      const password = 'admin123';
      const hashedPassword = await bcryptjs.hash(password, 10);

      await pool.query(`
        INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt")
        VALUES ($1, 'Admin', $2, 'admin', true, NOW(), NOW())
      `, [newUserId, email]);

      // Criar conta de autenticação
      const accountId = crypto.randomUUID();
      await pool.query(`
        INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
        VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())
      `, [accountId, email, newUserId, hashedPassword]);

      console.log('✅ Admin criado com sucesso!');
      console.log('📧 Email: admin@ibzn.com');
      console.log('🔑 Senha: admin123');
      return;
    }

    const admin = userResult.rows[0];
    console.log(`✅ Admin encontrado: ${admin.name} (${admin.email})`);

    // Nova senha
    const newPassword = 'admin123';
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Atualizar senha na tabela account
    const updateResult = await pool.query(`
      UPDATE "account"
      SET password = $1, "updatedAt" = NOW()
      WHERE "userId" = $2
      RETURNING id
    `, [hashedPassword, admin.id]);

    if (updateResult.rows.length === 0) {
      console.log('⚠️  Conta não encontrada. Criando...');
      
      const accountId = crypto.randomUUID();
      await pool.query(`
        INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
        VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())
      `, [accountId, admin.email, admin.id, hashedPassword]);
      
      console.log('✅ Conta criada com sucesso!');
    } else {
      console.log('✅ Senha atualizada com sucesso!');
    }

    console.log('\n📧 Email: ' + admin.email);
    console.log('🔑 Nova senha: admin123');
    console.log('\n⚠️  IMPORTANTE: Altere esta senha após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();
