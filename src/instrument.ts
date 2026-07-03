import { Client } from "pg";
import { PgDriver } from "./drivers/pg.driver";
import { TimingInterceptor } from "./interceptors/timingInterceptor";
import { StackTraceInterceptor } from "./interceptors/stackTraceInterceptor";
import { FingerprintInterceptor } from "./interceptors/fingerprintInterceptor";
import { ConfigurationError } from "./errors/query.errors";
import { SlowQueryInterceptor } from "./interceptors/slowQueryInterceptor";

export function instrumentPg(client: Client) {
  if (!client) {
    throw new ConfigurationError("Client instance is required");
  }

  const original = client.query.bind(client) as typeof client.query;

  if (typeof original !== "function") {
    throw new ConfigurationError("Client.query is not a function");
  }

  const driver = new PgDriver(client, original);

  driver
    .use(new TimingInterceptor())
    .use(new StackTraceInterceptor())
    .use(new FingerprintInterceptor())
    .use(new SlowQueryInterceptor(1000)); 

  client.query = function (this: any, ...args: any[]) {
    try {
      const callerStack = new Error().stack ?? "";

      const firstArg = args[0];

      if (typeof firstArg === "string") {
        const params = Array.isArray(args[1]) ? args[1] : undefined;
        return driver.query(firstArg, params, callerStack);
      }

      if (firstArg && typeof firstArg === "object" && "text" in firstArg) {
        return driver.query(
          (firstArg as any).text,
          (firstArg as any).values,
          callerStack,
        );
      }

      return (original as any).apply(this, args);
    } catch (error) {
      console.error("Error in instrumented query:", error);
      throw error;
    }
  } as typeof client.query;
}
