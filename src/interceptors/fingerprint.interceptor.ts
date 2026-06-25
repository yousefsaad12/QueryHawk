import { QueryContext } from "../context/query.context";
import { Interceptor } from "../core/interceptor.interface";

export class FingerprintInterceptor implements Interceptor<
  QueryContext,
  any[]
> {
  private fingerprintMap: Map<string, number> = new Map();
  public afterQuery(result: any[], queryContext: QueryContext) {
    const fingerprint = this.normalize(queryContext.sql);

    queryContext.normalizedSql = fingerprint;
    this.fingerprintMap.set(
      fingerprint,
      (this.fingerprintMap.get(fingerprint) || 0) + 1,
    );

    return result;
  }

  private normalize(sql: string): string {
    return sql
      .replace(/'([^'\\]|\\.)*'/g, "?")
      .replace(/\$\d+/g, "?")
      .replace(/-?\b\d+(\.\d+)?\b/g, "?")
      .replace(/\b(true|false|null)\b/gi, "?")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  public getStats(): Map<string, number> {
    return new Map(this.fingerprintMap);
  }
}
