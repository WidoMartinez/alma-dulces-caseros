import { getDb } from './server/db.ts';

async function checkTable() {
  console.log('Verificando tabla blockedDates...');
  
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  try {
    // Verificar si la tabla existe
    const tables = await db.execute('SHOW TABLES LIKE "blockedDates"');
    console.log('Resultado de SHOW TABLES:', tables);

    if (tables[0].length === 0) {
      console.log('❌ La tabla blockedDates NO existe');
      console.log('Necesitas ejecutar las migraciones con: pnpm run db:push');
    } else {
      console.log('✓ La tabla blockedDates existe');
      
      // Describir la estructura de la tabla
      const structure = await db.execute('DESCRIBE blockedDates');
      console.log('\nEstructura de la tabla:');
      console.log(structure[0]);
      
      // Contar registros
      const count = await db.execute('SELECT COUNT(*) as count FROM blockedDates');
      console.log('\nNúmero de registros:', count[0][0].count);
    }
  } catch (error) {
    console.error('Error al verificar la tabla:', error.message);
    console.error('Stack:', error.stack);
  }

  process.exit(0);
}

checkTable();
