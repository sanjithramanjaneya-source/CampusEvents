import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const hash = await bcrypt.hash("Campus@123", 10);
const [result] = await conn.query(
  "UPDATE users SET password_hash = ? WHERE password_hash NOT LIKE '$2%'",
  [hash]
);
console.log("Users updated:", result.affectedRows);
await conn.end();