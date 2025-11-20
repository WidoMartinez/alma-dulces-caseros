import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log("Diagnóstico completo de autenticación...\n");

try {
  // 1. Listar todos los usuarios
  const [allUsers] = await connection.query("SELECT id, username, email, role, password FROM users");
  
  console.log("📋 Usuarios en la base de datos:");
  allUsers.forEach(u => {
    console.log(`  - ID: ${u.id}, Username: ${u.username}, Email: ${u.email}, Role: ${u.role}`);
    console.log(`    Password: ${u.password ? '✓ Configurada' : '✗ Sin configurar'}`);
  });

  console.log("\n" + "=".repeat(60));
  
  // 2. Probar diferentes combinaciones
  const testCases = [
    { input: "admin", password: "admin123" },
    { input: "admin@alma-dulces.cl", password: "admin123" },
  ];

  for (const test of testCases) {
    console.log(`\n🔍 Probando login con: "${test.input}"`);
    
    // Buscar usuario
    const [users] = await connection.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [test.input, test.input]
    );

    if (users.length === 0) {
      console.log("  ❌ Usuario no encontrado");
      continue;
    }

    const user = users[0];
    console.log(`  ✓ Usuario encontrado: ${user.username} (${user.email})`);
    
    if (!user.password) {
      console.log("  ❌ No tiene contraseña configurada");
      continue;
    }

    // Probar contraseña
    const isValid = await bcrypt.compare(test.password, user.password);
    console.log(`  ${isValid ? '✅' : '❌'} Contraseña "${test.password}": ${isValid ? 'CORRECTA' : 'INCORRECTA'}`);
    
    if (!isValid) {
      // Mostrar información del hash
      console.log(`  📝 Hash actual: ${user.password.substring(0, 30)}...`);
      console.log(`  💡 Regenerando hash para "${test.password}"...`);
      
      const newHash = await bcrypt.hash(test.password, 12);
      await connection.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [newHash, user.id]
      );
      
      // Verificar el nuevo hash
      const testNew = await bcrypt.compare(test.password, newHash);
      console.log(`  ✅ Hash actualizado y verificado: ${testNew ? 'OK' : 'ERROR'}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ Diagnóstico completado");
  console.log("\n📌 Credenciales finales:");
  console.log("   Username: admin");
  console.log("   Password: admin123");
  console.log("\n💡 Asegúrate de que el servidor esté corriendo y recarga la página");

} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
} finally {
  await connection.end();
}

process.exit(0);
