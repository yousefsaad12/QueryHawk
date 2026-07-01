import * as path from "path";

import { QueryContext } from "../context/query.context";
import { Interceptor } from "../core/interceptor.interface";

export class StackTraceInterceptor implements Interceptor<QueryContext, any[]> {
  private LIBRARY_DIRS = ["core", "interceptors", "drivers", "context", "instrument"];

  public beforeQuery(queryContext: QueryContext) {
    try {
      const lines = (queryContext.callerStack ?? "").split("\n");
      // Skip first few frames: Error creation, instrument.ts wrapper, and driver internals
      // Start from index 3 to skip: Error line, instrument.ts:29, and driver frames
      for (let i = 3; i < lines.length; i++) {
        const line = lines[i];
        
        // Handle both Windows and Unix stack trace formats
        const match = line.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)$/) ||
                      line.match(/\(?([^:]+):(\d+):(\d+)\)?$/);
        
        if (!match) continue;
        
        // Extract file path based on match format
        const filePath = match[2] || match[1];
        const lineNumber = match[3] || match[2];
        
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
      const normalizedPath = filePath.replace(/\\/g, '/');
      
      if (
        normalizedPath.includes("node_modules") ||
        normalizedPath.includes("node:internal")
      ) {
        return true;
      }
      
      return this.LIBRARY_DIRS.some((dir) =>
        normalizedPath.includes(`/${dir}/`) ||
        normalizedPath.includes(`\\${dir}\\`)
      );
    } catch (error) {
      console.error('Error in StackTraceInterceptor.isInternalFrame:', error);
      return false;
    }
  }
  
  private toRelativePath(absolutePath: string): string {
    try {
      const normalized = absolutePath.replace(/\\/g, '/');
      const relative = path.relative(process.cwd(), absolutePath);
      return relative.replace(/\\/g, '/');
    } catch (error) {
      console.error('Error in StackTraceInterceptor.toRelativePath:', error);
      return absolutePath.replace(/\\/g, '/');
    }
  }
}
