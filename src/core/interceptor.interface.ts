import {QueryContext} from "../context/query.context";
export interface Interceptor<TQuery, TResult> {
  beforeQuery?(query: QueryContext): TQuery | Promise<TQuery>;
  afterQuery?(result: TResult, query: QueryContext): TResult | Promise<TResult>;
  onError?(error: unknown, query: QueryContext): void;
}
