import * as path from "path";
import { QueryContext } from "../context/query.context";
import { Interceptor } from "../core/interceptor.interface";
export class StackTraceInterceptor implements Interceptor<QueryContext, any[]> {
  private LIBRARY_ROOT = path.resolve(__dirname, "..");
  LIBRARY_DIRS = ["core", "interceptors", "drivers", "context"].map(
    (dir) => path.join(this.LIBRARY_ROOT, dir) + path.sep,
  );
  public beforeQuery(queryContext: QueryContext) {
    queryContext.stackTrace = this.captureCallStackTrace();
    return queryContext;
  }

  private captureCallStackTrace(): string | undefined {
    const target: { stack?: string } = {};
    Error.captureStackTrace(target, this.captureCallStackTrace);
    const lines = target.stack?.split("\n").slice(1) ?? [];

    for (const line of lines) {
      const match = line.match(/\(?(.+):(\d+):(\d+)\)?$/);
      if (!match) continue;
      const [, filePath, lineNumber] = match;
      if (this.isInternalFrame(filePath)) continue;
      return `${this.toRelativePath(filePath)}:${lineNumber}`;
    }

    return undefined;
  }

  private isInternalFrame(filePath: string): boolean {
    if (
      filePath.includes("node_modules") ||
      filePath.includes("node:internal")
    ) {
      return true;
    }
    return this.LIBRARY_DIRS.some((dir) => filePath.startsWith(dir));
  }

  private toRelativePath(absolutePath: string): string { 
    return path.relative(process.cwd(), absolutePath);
  }
}
