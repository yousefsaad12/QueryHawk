import * as path from "path";

import { QueryContext } from "../context/query.context";
import { Interceptor } from "../core/interceptor.interface";

export class StackTraceInterceptor implements Interceptor<QueryContext, any[]> {
  private LIBRARY_DIRS = ["core", "interceptors", "drivers", "context"];

  public beforeQuery(queryContext: QueryContext) {
    try {
      const lines = (queryContext.callerStack ?? "").split("\n").slice(1);
      for (const line of lines) {
        const match = line.match(/\(?(.+):(\d+):(\d+)\)?$/);
        if (!match) continue;
        const [, filePath, lineNumber] = match;
        if (this.isInternalFrame(filePath)) continue;
        queryContext.stackTrace = `${this.toRelativePath(filePath)}:${lineNumber}`;
        return queryContext;
      }
    } catch (error) {
      console.error('Error in StackTraceInterceptor.beforeQuery:', error);
    }
    return queryContext;
  }

  private isInternalFrame(filePath: string): boolean {
    try {
      if (
        filePath.includes("node_modules") ||
        filePath.includes("node:internal")
      ) {
        return true;
      }
      return this.LIBRARY_DIRS.some((dir) =>
        filePath.includes(path.sep + dir + path.sep),
      );
    } catch (error) {
      console.error('Error in StackTraceInterceptor.isInternalFrame:', error);
      return false;
    }
  }
  
  private toRelativePath(absolutePath: string): string {
    try {
      return path.relative(process.cwd(), absolutePath);
    } catch (error) {
      console.error('Error in StackTraceInterceptor.toRelativePath:', error);
      return absolutePath;
    }
  }
}
