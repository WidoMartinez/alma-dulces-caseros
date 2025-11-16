/**
 * Script para crear un usuario administrador
 * 
 * Uso:
 *   node create-admin.mjs <username> <email> <password> [nombre]
 * 
 * Ejemplo:
 *   node create-admin.mjs admin admin@alma-dulces.cl miPassword123 "Administrador"
 */

import "dotenv/config";
import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "./drizzle/schema.ts";

const SALT_ROUNDS = 12;

async function createAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error("❌ Error: Argumentos insuficientes");
    console.log("\nUso:");
    console.log("  node create-admin.mjs <username> <email> <password> [nombre]");
    console.log("\nEjemplo:");
    console.log('  node create-admin.mjs admin admin@alma-dulces.cl miPassword123 "Administrador"');
    process.exit(1);
  }

  const [username, email, password, name] = args;

  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL no está configurada");
    console.log("\nConfigura la variable de entorno DATABASE_URL en tu archivo .env:");
    console.log("  DATABASE_URL=mysql://usuario:contraseña@localhost:3306/alma_dulces");
    process.exit(1);
  }

  try {
    console.log("🔄 Conectando a la base de datos...");
    const db = drizzle(process.env.DATABASE_URL);

    console.log("🔐 Generando hash de la contraseña...");
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    console.log("👤 Creando usuario administrador...");
    await db.insert(users).values({
      username,
      email,
      password: passwordHash,
      name: name || null,
      role: "admin",
      loginMethod: "local",
      lastSignedIn: new Date(),
    });

    console.log("\n✅ ¡Usuario administrador creado exitosamente!\n");
    console.log("Detalles del usuario:");
    console.log(`  Username: ${username}`);
    console.log(`  Email: ${email}`);
    console.log(`  Nombre: ${name || "(sin nombre)"}`);
    console.log(`  Rol: admin`);
    console.log("\nPuedes iniciar sesión en /login con estas credenciales.");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error al crear usuario administrador:", error);
    
    if (error.code === "ER_DUP_ENTRY") {
      console.log("\n💡 Este username o email ya existe en la base de datos.");
      console.log("   Intenta con un username o email diferente.");
    }
    
    process.exit(1);
  }
}

createAdmin();
