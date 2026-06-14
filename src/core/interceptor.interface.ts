export interface Interceptor<TQuery, TResult> {
  beforeQuery?(query: TQuery): TQuery | Promise<TQuery>;
  afterQuery?(result: TResult, query: TQuery): TResult | Promise<TResult>;
  onError?(error: unknown, query: TQuery): void;
}
