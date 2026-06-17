import { Interceptor } from "../core/interceptor.interface";
import { QueryContext } from "../context/query.context";

export class TimingInterceptor implements Interceptor<QueryContext, any[]> {
  private queryStartTime: Map<string, number> = new Map<string, number>();

  public beforeQuery(queryContext: QueryContext) {
    this.queryStartTime.set(queryContext.sql, Date.now());
    return queryContext;
  }

  public afterQuery(result: any[], queryContext: QueryContext) {
    const duration: number =
      Date.now() - this.queryStartTime.get(queryContext.sql)!;
    queryContext.duration = duration;
    console.log(`Query: ${queryContext.sql}, Duration: ${duration}ms`);
    this.queryStartTime.delete(queryContext.sql);
    return result;
  }

  public onError(error: unknown, queryContext: QueryContext) {
    this.queryStartTime.delete(queryContext.sql);
    queryContext.error =
      error instanceof Error ? error : new Error(String(error));
    queryContext.success = false;
    console.log(`Query failed: ${queryContext.sql}`);
    console.log(
      `error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
