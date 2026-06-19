import * as path from "path";

import { QueryContext } from "../context/query.context";
import { Interceptor } from "../core/interceptor.interface";

export class StackTraceInterceptor implements Interceptor<QueryContext, any[]> {
  private LIBRARY_DIRS = ["core", "interceptors", "drivers", "context"];

  public beforeQuery(queryContext: QueryContext) {
    const lines = (queryContext.callerStack ?? "").split("\n").slice(1);
    for (const line of lines) {
      const match = line.match(/\(?(.+):(\d+):(\d+)\)?$/);
      if (!match) continue;
      const [, filePath, lineNumber] = match;
      if (this.isInternalFrame(filePath)) continue;
      queryContext.stackTrace = `${this.toRelativePath(filePath)}:${lineNumber}`;
      return queryContext;
    }
    return queryContext;
  }

  private isInternalFrame(filePath: string): boolean {
    if (
      filePath.includes("node_modules") ||
      filePath.includes("node:internal")
    ) {
      return true;
    }
    return this.LIBRARY_DIRS.some((dir) =>
      filePath.includes(path.sep + dir + path.sep),
    );
  }
  private toRelativePath(absolutePath: string): string {
    return path.relative(process.cwd(), absolutePath);
  }
}
