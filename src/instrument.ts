import { Client } from "pg";
import { PgDriver } from "./drivers/pg.driver";
import { TimingInterceptor } from "./interceptors/timing.interceptor";
import { StackTraceInterceptor } from "./interceptors/stackTrace.interceptor";
import { FingerprintInterceptor } from "./interceptors/fingerprint.interceptor";
import { ConfigurationError } from "./errors/query.errors";

export function instrumentPg(client: Client) {
  if (!client) {
    throw new ConfigurationError('Client instance is required');
  }

  const original = client.query.bind(client) as typeof client.query;
  
  if (typeof original !== 'function') {
    throw new ConfigurationError('Client.query is not a function');
  }

  const driver = new PgDriver(client, original);

  driver
    .use(new TimingInterceptor())
    .use(new StackTraceInterceptor())
    .use(new FingerprintInterceptor());

  client.query = function (this: any, ...args: any[]) {
    try {
      // Capture stack trace at the point of actual query call
      const callerStack = new Error().stack ?? "";
      
      const firstArg = args[0];

      if (typeof firstArg === "string") {
        const params = Array.isArray(args[1]) ? args[1] : undefined;
        return driver.query(firstArg, params, callerStack);
      }

      if (firstArg && typeof firstArg === "object" && "text" in firstArg) {
        return driver.query((firstArg as any).text, (firstArg as any).values, callerStack);
      }

      return (original as any).apply(this, args);
    } catch (error) {
      console.error('Error in instrumented query:', error);
      throw error;
    }
  } as typeof client.query;
}
