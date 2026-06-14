import { Interceptor } from "../core/interceptor.interface";
export class TimingInterceptor implements Interceptor<string, any[]> {
  private queryStartTime: Map<string, number> = new Map<string, number>();

  public beforeQuery(query: string) {
    this.queryStartTime.set(query, Date.now());

    return query;
  }

  public afterQuery(result: any[], query: string) {
    const duration: number = Date.now() - this.queryStartTime.get(query)!;

    console.log(`Query: ${query}, Duration: ${duration}ms`);
    this.queryStartTime.delete(query);
    return result;
  }

  public onError(error: unknown, query: string) {
    this.queryStartTime.delete(query);
    console.log(`Query failed: ${query}`);
  }
}
