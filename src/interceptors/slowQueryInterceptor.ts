import { QueryResult } from "pg";
import { QueryContext } from "../context/query.context";
import { Interceptor } from "../core/interceptor.interface";

export class SlowQueryInterceptor implements Interceptor<QueryContext, QueryResult> {
  private slowQueryThreshold: number;

  constructor(slowQueryThreshold: number) {
    this.slowQueryThreshold = slowQueryThreshold;
  }

  public afterQuery(result:QueryResult, queryContext: QueryContext) {
    try {
      const duration = queryContext.duration ?? 0;
      if (duration > this.slowQueryThreshold) {
        queryContext.isSlow = true;
      }

      return result;
    } catch (error) {
      console.error("Error in SlowQueryInterceptor.afterQuery:", error);
      return result;
    }
  }
}
