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
      console.error("Error in FingerprintInterceptor.afterQuery:", error);
    }
    return result;
  }

  private normalize(sql: string): string {
    return (
      sql
        // Strip comments first (must happen before anything else)
        .replace(/--.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")

        // Strings (single-quoted, handles escaped quotes)
        .replace(/'([^'\\]|\\.)*'/g, "?")

        // UUIDs (unquoted) — must run BEFORE number regex
        .replace(
          /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
          "?",
        )

        // PG positional params
        .replace(/\$\d+/g, "?")

        // Booleans/null
        .replace(/\b(true|false|null)\b/gi, "?")

        // Numbers
        .replace(/-?\b\d+(\.\d+)?\b/g, "?")

        // Collapse IN lists (handles 1+ elements, including single-item)
        .replace(/\(\s*\?\s*(,\s*\?\s*)*\)/g, "(?)")

        // Normalize spacing around punctuation/operators
        .replace(/\s*([=,()<>]|<=|>=|!=|<>)\s*/g, "$1")

        // Strip trailing semicolon
        .replace(/;\s*$/g, "")

        // Collapse remaining whitespace
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
    );
  }
  public getStats(): Map<string, number> {
    try {
      return new Map(this.fingerprintMap);
    } catch (error) {
      console.error("Error in FingerprintInterceptor.getStats:", error);
      return new Map();
    }
  }
}
