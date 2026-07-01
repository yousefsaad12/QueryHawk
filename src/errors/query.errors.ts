export class QueryHawkError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConnectionError extends QueryHawkError {
  constructor(message: string, originalError?: unknown) {
    super(`Connection failed: ${message}`, originalError);
  }
}

export class QueryExecutionError extends QueryHawkError {
  constructor(
    message: string,
    public sql?: string,
    public params?: any[],
    originalError?: unknown,
  ) {
    super(`Query execution failed: ${message}`, originalError);
  }
}

export class ValidationError extends QueryHawkError {
  constructor(message: string, originalError?: unknown) {
    super(`Validation failed: ${message}`, originalError);
  }
}

export class ConfigurationError extends QueryHawkError {
  constructor(message: string, originalError?: unknown) {
    super(`Configuration error: ${message}`, originalError);
  }
}

export class TimeoutError extends QueryHawkError {
  constructor(message: string, originalError?: unknown) {
    super(`Operation timed out: ${message}`, originalError);
  }
}

export function isPostgresError(error: unknown): error is { code: string; detail?: string; table?: string; constraint?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error
  );
}

export function getPostgresErrorCode(error: unknown): string | null {
  if (isPostgresError(error)) {
    return error.code;
  }
  return null;
}

const ERROR_CODE_MAP = {
  // Connection errors (08xxx)
  '08000': { type: 'connection', message: 'Connection exception' },
  '08001': { type: 'connection', message: 'SQL client unable to establish SQL connection' },
  '08003': { type: 'connection', message: 'Connection does not exist' },
  '08004': { type: 'connection', message: 'SQL server rejected establishment of SQL connection' },
  '08006': { type: 'connection', message: 'Connection failure' },
  '08007': { type: 'connection', message: 'Transaction resolution unknown' },
  
  // Constraint violations
  '23505': { type: 'query', message: 'Unique constraint violation' },
  '23503': { type: 'query', message: 'Foreign key constraint violation' },
  '23502': { type: 'query', message: 'Not null constraint violation' },
  '23514': { type: 'query', message: 'Check constraint violation' },
  
  // Syntax errors
  '42601': { type: 'query', message: 'SQL syntax error' },
  
  // Permission errors
  '42501': { type: 'query', message: 'Insufficient privileges' },
  
  // Table/column not found
  '42P01': { type: 'query', message: 'Table not found' },
  '42703': { type: 'query', message: 'Column not found' },
} as const;

export function classifyPostgresError(error: unknown): QueryHawkError {
  const code = getPostgresErrorCode(error);
  
  if (!code) {
    return new QueryExecutionError('Unknown database error', undefined, undefined, error);
  }

  // Check for connection errors (08xxx prefix)
  if (code.startsWith('08')) {
    return new ConnectionError('Database connection error', error);
  }

  // Look up specific error code
  const errorInfo = ERROR_CODE_MAP[code as keyof typeof ERROR_CODE_MAP];
  
  if (errorInfo) {
    if (errorInfo.type === 'connection') {
      return new ConnectionError(errorInfo.message, error);
    }
    return new QueryExecutionError(errorInfo.message, undefined, undefined, error);
  }

  // Default to generic query execution error
  return new QueryExecutionError(`PostgreSQL error (${code})`, undefined, undefined, error);
}
