import { Interceptor } from "../core/interceptor.interface";
import { QueryContext } from "../context/query.context";

export class TimingInterceptor implements Interceptor<QueryContext, any[]> {
  private queryStartTime: Map<string, number> = new Map<string, number>();

  public beforeQuery(query: QueryContext) {
    this.queryStartTime.set(query.sql, Date.now());
    return query;
  }

  public afterQuery(result: any[], query: QueryContext) {
    const duration: number = Date.now() - this.queryStartTime.get(query.sql)!;
    query.duration = duration
    console.log(`Query: ${query.sql}, Duration: ${duration}ms`);
    this.queryStartTime.delete(query.sql);
    return result;
  }

  public onError(error: unknown, query: QueryContext) {
    this.queryStartTime.delete(query.sql);
    console.log(`Query failed: ${query.sql}`);
  }
}
