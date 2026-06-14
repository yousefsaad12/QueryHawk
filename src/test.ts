import "dotenv/config";
import { Client } from "pg";
import { PgDriver } from "./drivers/pg.driver";
import { TimingInterceptor } from "./interceptors/timing.interceptor";

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await client.connect();
  console.log("connected to database");
  const driver = new PgDriver(client);

  driver.use(new TimingInterceptor());

  const result = await driver.execute("SELECT * FROM users");
  console.log("result:", result);

  await client.end();
}
main().catch(console.error);
