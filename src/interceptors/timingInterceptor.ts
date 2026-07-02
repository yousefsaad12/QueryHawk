import { Interceptor } from "../core/interceptor.interface";
import { QueryContext } from "../context/query.context";

export class TimingInterceptor implements Interceptor<QueryContext, any[]> {
  private queryStartTime: Map<string, number> = new Map<string, number>();

  public beforeQuery(queryContext: QueryContext) {
    try {
      this.queryStartTime.set(queryContext.sql, Date.now());
    } catch (error) {
      console.error('Error in TimingInterceptor.beforeQuery:', error);
    }
    return queryContext;
  }

  public afterQuery(result: any[], queryContext: QueryContext) {
    try {
      const startTime = this.queryStartTime.get(queryContext.sql);
      if (startTime !== undefined) {
        const duration: number = Date.now() - startTime;
        queryContext.duration = duration;
      }
      this.queryStartTime.delete(queryContext.sql);
    } catch (error) {
      console.error('Error in TimingInterceptor.afterQuery:', error);
    }
    return result;
  }

  public onError(error: unknown, queryContext: QueryContext) {
    try {
      this.queryStartTime.delete(queryContext.sql);
      queryContext.error =
        error instanceof Error ? error : new Error(String(error));
      queryContext.success = false;
    } catch (err) {
      console.error('Error in TimingInterceptor.onError:', err);
    }
  }
}
