import "dotenv/config";
import { Client } from "pg";
import {
  ConfigurationError,
  ConnectionError,
  QueryExecutionError,
  classifyPostgresError,
} from "./errors/query.errors";
import { instrumentPg } from "./instrument";

async function main() {
  try {
    await getUsers();
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error("Configuration Error:", error.message);
      if (error.originalError)
        console.error("Original error:", error.originalError);
    } else if (error instanceof ConnectionError) {
      console.error("Connection Error:", error.message);
      if (error.originalError)
        console.error("Original error:", error.originalError);
    } else if (error instanceof QueryExecutionError) {
      console.error("Query Execution Error:", error.message);
      if (error.sql) console.error("Failed SQL:", error.sql);
      if (error.params) console.error("Parameters:", error.params);
      if (error.originalError)
        console.error("Original error:", error.originalError);
    } else {
      console.error("Unexpected error:", error);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error in main:", error);
  process.exit(1);
});

async function getUsers() {
  // Validate environment variables
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new ConfigurationError(`Missing required environment variable: ${envVar}`);
    }
  }

  const port = Number(process.env.DB_PORT);
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new ConfigurationError(`Invalid DB_PORT: must be a valid port number (1-65535)`);
  }

  const client = new Client({
    host: process.env.DB_HOST,
    port: port,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log("connected to database");
  } catch (error) {
    throw classifyPostgresError(error);
  }

  try {
    instrumentPg(client);

    // --- Fingerprint equivalence: numeric literal vs param ---
    const result1 = await client.query(
      "select * from users where id = $1",
      [3],
    );
    const result2 = await client.query("select * from users where id = 1");
    const result3 = await client.query(
      "select * from users where id = $1",
      [3],
    );
    const result4 = await client.query(
      "select * from users where id = $1",
      [3],
    );

    // --- Whitespace / case equivalence ---
    const result5 = await client.query("SELECT * FROM users WHERE id = 1");
    const result6 = await client.query(
      "select   *   from   users   where   id=1",
    );

    // --- String literals ---
    const result7 = await client.query("select * from users where email = $1", [
      "ahmed@example.com",
    ]);
    const result8 = await client.query("select * from users where email = $1", [
      "omar@example.com",
    ]);

    // --- Boolean literals ---
    const result9 = await client.query(
      "select * from users where is_active = true",
    );
    const result10 = await client.query(
      "select * from products where in_stock = false",
    );

    // --- IN lists of different lengths (should share one fingerprint) ---
    const result11 = await client.query(
      "select * from users where id in (1,2,3)",
    );
    const result12 = await client.query(
      "select * from users where id in (1,2,3,4,5)",
    );

    // --- Joins (multi-table, more complex fingerprint) ---
    const result13 = await client.query(
      `select u.name, o.total, o.status
       from orders o
       join users u on u.id = o.user_id
       where o.status = $1`,
      ["completed"],
    );

    // --- Aggregates ---
    const result14 = await client.query(
      "select status, count(*), sum(total) from orders group by status",
    );

    // --- LIKE / pattern matching ---
    const result15 = await client.query(
      "select * from logs where message like $1",
      ["%login%"],
    );

    // --- Comments (should be stripped before fingerprinting) ---
    const result16 = await client.query(
      `select * from users -- get active users
       where is_active = true`,
    );

    // --- Slow query (adjust duration relative to your SlowQueryInterceptor threshold) ---
    const result17 = await client.query("select pg_sleep(1.2), * from orders");

    // --- Intentional error (invalid table, tests error/QueryExecutionError path) ---
    let result18: any = null;
    try {
      result18 = await client.query("select * from this_table_does_not_exist");
    } catch (error) {
      console.log("Expected error caught:", (error as Error).message);
    }

    console.log("Query result 1:", result1.rows);
    console.log("Query result 2:", result2.rows);
    console.log("Query result 3:", result3.rows);
    console.log("Query result 4:", result4.rows);
    console.log("Query result 5:", result5.rows);
    console.log("Query result 6:", result6.rows);
    console.log("Query result 7:", result7.rows);
    console.log("Query result 8:", result8.rows);
    console.log("Query result 9:", result9.rows);
    console.log("Query result 10:", result10.rows);
    console.log("Query result 11:", result11.rows);
    console.log("Query result 12:", result12.rows);
    console.log("Query result 13:", result13.rows);
    console.log("Query result 14:", result14.rows);
    console.log("Query result 15:", result15.rows);
    console.log("Query result 16:", result16.rows);
    console.log("Query result 17: (slow query completed)");
    console.log(
      "Query result 18:",
      result18 ? result18.rows : "(errored as expected)",
    );
  } finally {
    await client.end().catch((error) => {
      console.error("Error closing database connection:", error);
    });
  }
}
