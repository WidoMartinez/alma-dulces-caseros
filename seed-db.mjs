import mysql from "mysql2/promise";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Clear existing data
await connection.execute("DELETE FROM products");
await connection.execute("DELETE FROM categories");

// Insert categories
const categories = [
  { name: "Tartas", description: "Tartas artesanales deliciosas" },
  { name: "Galletas", description: "Galletas crujientes y sabrosas" },
  { name: "Brownies", description: "Brownies de chocolate intenso" },
  { name: "Mermeladas", description: "Mermeladas caseras naturales" },
];

for (const cat of categories) {
  await connection.execute(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [cat.name, cat.description]
  );
}

// Get category IDs
const [categoriesResult] = await connection.execute(
  "SELECT id, name FROM categories"
);

const categoryMap = {};
categoriesResult.forEach(cat => {
  categoryMap[cat.name] = cat.id;
});

// Insert products
const products = [
  {
    categoryId: categoryMap["Tartas"],
    name: "Tarta de Frutos Rojos",
    description: "Deliciosa tarta con frutos rojos frescos y crema artesanal",
    ingredients: "Fresas, frambuesas, arándanos, crema, harina integral",
    price: 25000,
    available: 5,
    organic: 1,
  },
  {
    categoryId: categoryMap["Tartas"],
    name: "Tarta de Chocolate",
    description: "Tarta de chocolate belga con relleno cremoso",
    ingredients: "Chocolate 70%, crema, huevos, azúcar morena",
    price: 28000,
    available: 8,
    organic: 1,
  },
  {
    categoryId: categoryMap["Galletas"],
    name: "Galletas de Avena y Miel",
    description: "Galletas crujientes con avena y miel pura",
    ingredients: "Avena, miel, mantequilla, harina de trigo integral",
    price: 8000,
    available: 20,
    organic: 1,
  },
  {
    categoryId: categoryMap["Galletas"],
    name: "Galletas de Almendra",
    description: "Galletas delicadas con almendra molida",
    ingredients: "Almendra, huevo, azúcar de caña, vainilla",
    price: 9500,
    available: 15,
    organic: 1,
  },
  {
    categoryId: categoryMap["Brownies"],
    name: "Brownie de Chocolate Oscuro",
    description: "Brownie denso y jugoso de chocolate oscuro",
    ingredients: "Chocolate 85%, mantequilla, huevos, harina",
    price: 12000,
    available: 12,
    organic: 1,
  },
  {
    categoryId: categoryMap["Brownies"],
    name: "Brownie con Nueces",
    description: "Brownie con nueces de macadamia tostadas",
    ingredients: "Chocolate, nueces, mantequilla, huevos",
    price: 14000,
    available: 10,
    organic: 1,
  },
  {
    categoryId: categoryMap["Mermeladas"],
    name: "Mermelada de Fresa",
    description: "Mermelada casera de fresa sin conservantes",
    ingredients: "Fresas, azúcar de caña, limón",
    price: 7500,
    available: 25,
    organic: 1,
  },
  {
    categoryId: categoryMap["Mermeladas"],
    name: "Mermelada de Frambuesa",
    description: "Mermelada artesanal de frambuesa silvestre",
    ingredients: "Frambuesas, azúcar, limón",
    price: 8500,
    available: 18,
    organic: 1,
  },
];

for (const product of products) {
  await connection.execute(
    "INSERT INTO products (categoryId, name, description, ingredients, price, available, organic) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      product.categoryId,
      product.name,
      product.description,
      product.ingredients,
      product.price,
      product.available,
      product.organic,
    ]
  );
}

console.log("✓ Base de datos poblada con éxito");
await connection.end();
