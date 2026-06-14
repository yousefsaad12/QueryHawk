import { Interceptor } from "./interceptor.interface";

export abstract class BaseDriver<TQuery, TResult> {
  private interceptors: Interceptor<TQuery, TResult>[] = [];

  public use(interceptor: Interceptor<TQuery, TResult>) {
    this.interceptors.push(interceptor);
    return this;
  }

  public async execute(query: TQuery) {
    let q = query;

    for (const interceptor of this.interceptors) {
      if (interceptor.beforeQuery) q = await interceptor.beforeQuery(q);
    }

    let result: TResult;

    try {
      result = await this.run(q);
    } catch (error) {
      this.interceptors.forEach((interceptor) =>
        interceptor.onError?.(error, q),
      );
      throw error;
    }

    for (const i of [...this.interceptors].reverse()) {
      if (i.afterQuery) result = await i.afterQuery(result, q);
    }

    return result;
  }

  protected abstract run(query: TQuery): Promise<TResult>;
}
