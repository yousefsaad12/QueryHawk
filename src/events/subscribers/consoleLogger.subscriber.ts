import { QueryContext } from "../../context/query.context";
import { Subscriber } from "../subscriber.interface";

export class ConsoleLogSubscriber implements Subscriber {
  handle(event: QueryContext): void {
    try {
      if (!event.isSlow) return;
      this.printQueryContext(event);
    } catch (error) {
      console.error('Error in ConsoleLogSubscriber.handle:', error);
    }
  }

  private printQueryContext(queryContext: QueryContext): void {
    try {
      console.log("======================================");
      console.log("🧠 QUERY CONTEXT");

      console.log("--------------------------------------");
      console.log("SQL:", queryContext.sql);

    if (queryContext.params?.length) {
      console.log("PARAMS:", queryContext.params);
    }

    console.log("TYPE:", queryContext.queryType ?? "UNKNOWN");

    if (queryContext.normalizedSql) {
      console.log(`NORMALIZED SQL: ${queryContext.normalizedSql}`);
    }

    console.log("START TIME:", new Date(queryContext.startTime).toISOString());

    if (queryContext.duration !== undefined) {
      console.log("DURATION:", `${queryContext.duration}`, "ms");
    }

    console.log("SLOW QUERY:", queryContext.isSlow ? "⚠️ YES" : "NO");

    console.log("SUCCESS:", queryContext.success ? "✅" : "❌");

    if (queryContext.error) {
      console.log("ERROR:", queryContext.error.message);
      console.log("STACK:", queryContext.error.stack);
    }

    if (queryContext.explainPlan) {
      console.log("EXPLAIN PLAN:");
      console.dir(queryContext.explainPlan, { depth: null });
    }

    if (queryContext.suggestion) {
      console.log("SUGGESTION:");
      console.dir(queryContext.suggestion, { depth: null });
    }

    if (queryContext.stackTrace) {
      console.log("STACK TRACE (query origin):");
      console.log(queryContext.stackTrace);
    }

    console.log("======================================\n");
    } catch (error) {
      console.error('Error in ConsoleLogSubscriber.printQueryContext:', error);
    }
  }
}
