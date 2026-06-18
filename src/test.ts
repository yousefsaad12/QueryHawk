import "dotenv/config";
import { Client } from "pg";
import { PgDriver } from "./drivers/pg.driver";
import { TimingInterceptor } from "./interceptors/timing.interceptor";
import { StackTraceInterceptor } from "./interceptors/stackTrace.interceptor";

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

  driver.use(new TimingInterceptor()).use(new StackTraceInterceptor());

  const result = await driver.query("select * FROM users");
  console.log("result:", result);

  await client.end();
}
main().catch(console.error);
