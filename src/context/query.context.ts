export interface QueryContext {
  sql: string;
  fingerprint?: string;
  params?: any[];
  queryType?: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "OTHER";
  duration?: number;
  startTime: number;
  stackTrace?: string;
  isSlow?: boolean;
  error?: Error;
  success?: boolean;
  explainPlan?: any;
  suggestion?: any;
  callerStack?: string;
}
