import {
  getDispatchSettings,
  isDateAvailableForDispatch,
} from "./server/db.ts";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

async function testDateAvailability() {
  try {
    console.log("🧪 Probando disponibilidad de fechas...\n");

    // Obtener configuración
    const settings = await getDispatchSettings();
    console.log("📋 Configuración actual:");
    console.log("- Días de anticipación mínimos:", settings.minAdvanceDays);
    console.log("- Días de anticipación máximos:", settings.maxAdvanceDays);
    console.log("- Días disponibles:", settings.availableDays);
    console.log("- Días parseados:", JSON.parse(settings.availableDays));
    console.log();

    // Probar fechas
    const today = new Date();
    console.log("📅 Fecha actual:", today.toISOString());
    console.log();

    for (let i = 1; i <= 7; i++) {
      const testDate = new Date();
      testDate.setDate(today.getDate() + i);
      testDate.setHours(12, 0, 0, 0);

      const dayOfWeek = testDate.getDay();
      const dayNames = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];

      console.log(
        `Probando: ${testDate.toISOString().split("T")[0]} (${dayNames[dayOfWeek]}) - Día ${dayOfWeek}`
      );

      const isAvailable = await isDateAvailableForDispatch(testDate);
      console.log(`  ✓ Disponible: ${isAvailable ? "SÍ" : "NO"}`);
      console.log();
    }

    console.log("✅ Prueba completada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testDateAvailability();
