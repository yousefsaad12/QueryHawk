import { QueryContext } from "../context/query.context";
import { BaseDriver } from "../core/base.driver";
import { Client, QueryResult } from "pg";
export class PgDriver extends BaseDriver<QueryContext, any[]> {
  private client: Client;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  public async query(sql: string, params?: any[]) {
    const context: QueryContext = {
      sql,
      params,
      queryType: this.extractQueryType(sql),
      startTime: Date.now(),
    };

    return this.execute(context);
  }
  protected async run(query: QueryContext): Promise<any[]> {
    const result: QueryResult = await this.client.query(
      query.sql,
      query.params,
    );
    return result.rows;
  }

  protected extractQueryType(
    sql: string,
  ): "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "OTHER" {
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith("SELECT")) return "SELECT";
    if (trimmed.startsWith("INSERT")) return "INSERT";
    if (trimmed.startsWith("UPDATE")) return "UPDATE";
    if (trimmed.startsWith("DELETE")) return "DELETE";
    return "OTHER";
  }
}
