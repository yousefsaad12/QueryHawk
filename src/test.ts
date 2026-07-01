import "dotenv/config";
import { Client } from "pg";
import {
  ConfigurationError,
  ConnectionError,
  QueryExecutionError,
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

  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log("connected to database");

    instrumentPg(client);

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

    console.log("Query result:", result1);
    console.log("Query result:", result2);
    console.log("Query result:", result3);
    console.log("Query result:", result4);
  } finally {
    await client.end().catch((error) => {
      console.error("Error closing database connection:", error);
    });
  }
}
