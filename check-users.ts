import { db } from './src/lib/server/db';
import { user } from './src/lib/server/db/schema';
import { desc } from 'drizzle-orm';

async function checkUsers() {
    const users = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        })
        .from(user)
        .orderBy(desc(user.createdAt))
        .limit(10);

    console.log('\n📋 Usuários no banco:\n');
    users.forEach((u, i) => {
        console.log(`${i + 1}. ${u.name || 'Sem nome'}`);
        console.log(`   Email: ${u.email}`);
        console.log(`   Role: ${u.role}`);
        console.log(`   ID: ${u.id}\n`);
    });
}

checkUsers().then(() => process.exit(0));
