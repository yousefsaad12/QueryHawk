import "dotenv/config";
import { Client } from "pg";
import { PgDriver } from "./drivers/pg.driver";
import { TimingInterceptor } from "./interceptors/timing.interceptor";
import { StackTraceInterceptor } from "./interceptors/stackTrace.interceptor";
import { FingerprintInterceptor } from "./interceptors/fingerprint.interceptor";

async function main() {
  getUsers();
}
main().catch(console.error);

async function getUsers() {
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

  driver
    .use(new TimingInterceptor())
    .use(new StackTraceInterceptor())
    .use(new FingerprintInterceptor());

    const result1 = await driver.query("select * from users where id = $1", [3]);
    const result2 = await driver.query("select * from users where id = 1");
    const result3 = await driver.query("select * from users where id = $1", [3]);
    const result4 = await driver.query("select * from users where id = $1", [3]);
    
    console.log("Query result:", result1);
    console.log("Query result:", result2);
    console.log("Query result:", result3);
    console.log("Query result:", result4);
  await client.end();
}
