import { Interceptor } from "./interceptor.interface";
import { QueryContext } from "../context/query.context";
export abstract class BaseDriver<TQuery, TResult> {
  private interceptors: Interceptor<TQuery, TResult>[] = [];

  public use(interceptor: Interceptor<TQuery, TResult>) {
    this.interceptors.push(interceptor);
    return this;
  }

  public async execute(query: TQuery) {
    let q = query;
    const queryContext = query as unknown as QueryContext;

    for (const interceptor of this.interceptors) {
      if (interceptor.beforeQuery)
        q = await interceptor.beforeQuery(queryContext);
    }

    let result: TResult;

    try {
      result = await this.run(q);
    } catch (error) {
      this.interceptors.forEach((interceptor) =>
        interceptor.onError?.(error, queryContext),
      );
      this.logQueryContext(queryContext);
      throw error;
    }

    for (const interceptor of this.interceptors) {
      if (interceptor.afterQuery)
        result = await interceptor.afterQuery(result, queryContext);
    }
    queryContext.success = true;
    this.logQueryContext(queryContext);
    return result;
  }

  private logQueryContext(queryContext: QueryContext) {
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
  }

  protected abstract run(query: TQuery): Promise<TResult>;

  protected abstract extractQueryType(sql: string): string;
}
