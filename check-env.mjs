import 'dotenv/config';
import fs from 'fs';
import path from 'path';

console.log('--- Diagnóstico de Variables de Entorno ---');
console.log('CWD:', process.cwd());

const envPath = path.resolve(process.cwd(), '.env');
console.log('Buscando .env en:', envPath);

if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env encontrado.');
  const content = fs.readFileSync(envPath, 'utf-8');
  console.log('Longitud del contenido:', content.length);
  
  // Verificar si hay caracteres extraños
  if (content.charCodeAt(0) === 0xFEFF) {
    console.log('⚠️ ADVERTENCIA: El archivo tiene BOM (Byte Order Mark). Esto puede causar problemas.');
  }
} else {
  console.log('❌ Archivo .env NO encontrado.');
}

console.log('\nVariables Cargadas:');
const keysToCheck = [
  'DATABASE_URL',
  'FLOW_API_KEY',
  'FLOW_SECRET_KEY',
  'FLOW_API_URL',
  'VITE_APP_LOGO',
  'VITE_ANALYTICS_ENDPOINT'
];

keysToCheck.forEach(key => {
  const value = process.env[key];
  if (value) {
    const masked = value.length > 8 ? value.substring(0, 4) + '...' + value.substring(value.length - 4) : '****';
    console.log(`✅ ${key}: ${masked} (Longitud: ${value.length})`);
  } else {
    console.log(`❌ ${key}: NO DEFINIDA`);
  }
});

console.log('-------------------------------------------');
