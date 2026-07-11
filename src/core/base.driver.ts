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


  protected abstract run(query: TQuery): Promise<TResult>;

  protected abstract extractQueryType(sql: string): string;
}
