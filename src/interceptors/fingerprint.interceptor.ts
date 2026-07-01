import { QueryContext } from "../context/query.context";
import { Interceptor } from "../core/interceptor.interface";

export class FingerprintInterceptor implements Interceptor<
  QueryContext,
  any[]
> {
  private fingerprintMap: Map<string, number> = new Map();
  
  public afterQuery(result: any[], queryContext: QueryContext) {
    try {
      const fingerprint = this.normalize(queryContext.sql);

      queryContext.normalizedSql = fingerprint;
      this.fingerprintMap.set(
        fingerprint,
        (this.fingerprintMap.get(fingerprint) || 0) + 1,
      );
    } catch (error) {
      console.error('Error in FingerprintInterceptor.afterQuery:', error);
    }
    return result;
  }

  private normalize(sql: string): string {
    try {
      return sql
        .replace(/'([^'\\]|\\.)*'/g, "?")
        .replace(/\$\d+/g, "?")
        .replace(/-?\b\d+(\.\d+)?\b/g, "?")
        .replace(/\b(true|false|null)\b/gi, "?")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    } catch (error) {
      console.error('Error in FingerprintInterceptor.normalize:', error);
      return sql;
    }
  }

  public getStats(): Map<string, number> {
    try {
      return new Map(this.fingerprintMap);
    } catch (error) {
      console.error('Error in FingerprintInterceptor.getStats:', error);
      return new Map();
    }
  }
}
