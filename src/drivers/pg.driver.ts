import { QueryContext } from "../context/query.context";
import { BaseDriver } from "../core/base.driver";
import { Client, QueryResult } from "pg";
import { 
  QueryExecutionError, 
  ConnectionError, 
  ValidationError, 
  classifyPostgresError 
} from "../errors/query.errors";

export class PgDriver extends BaseDriver<QueryContext, any[]> {
  private client: Client;
  private nativeQuery: Function;

  constructor(client: Client, nativeQuery?: Function) {
    super();
    if (!client) {
      throw new ConnectionError('Client instance is required');
    }
    this.client = client;
    this.nativeQuery = nativeQuery || client.query.bind(client);
  }

  public async query(sql: string, params?: any[], callerStack?: string) {
    if (!sql || typeof sql !== 'string') {
      throw new ValidationError('SQL query must be a non-empty string');
    }

    if (sql.trim().length === 0) {
      throw new ValidationError('SQL query cannot be empty');
    }

    const context: QueryContext = {
      sql,
      params,
      queryType: this.extractQueryType(sql),
      startTime: Date.now(),
      callerStack,
    };

    return this.execute(context);
  }

  protected async run(query: QueryContext): Promise<any[]> {
    try {
      const result: QueryResult = await this.nativeQuery.call(
        this.client,
        query.sql,
        query.params,
      );
      return result.rows;
    } catch (error) {
      const classifiedError = classifyPostgresError(error);
      
      if (classifiedError instanceof QueryExecutionError) {
        classifiedError.sql = query.sql;
        classifiedError.params = query.params;
      }
      
      throw classifiedError;
    }
  }

  protected extractQueryType(
    sql: string,
  ): "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "OTHER" {
    if (!sql || typeof sql !== 'string') {
      return "OTHER";
    }
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith("SELECT")) return "SELECT";
    if (trimmed.startsWith("INSERT")) return "INSERT";
    if (trimmed.startsWith("UPDATE")) return "UPDATE";
    if (trimmed.startsWith("DELETE")) return "DELETE";
    return "OTHER";
  }
}
