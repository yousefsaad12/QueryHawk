import { QueryContext } from "../context/query.context";
import { Interceptor } from "../core/interceptor.interface";

export class SlowQueryInterceptor implements Interceptor<QueryContext, any[]> {
  private slowQueryThreshold: number;

  constructor(slowQueryThreshold: number) {
    this.slowQueryThreshold = slowQueryThreshold;
  }

  public afterQuery(result: any[], queryContext: QueryContext) {
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
