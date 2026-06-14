import { BaseDriver } from "../core/base.driver";
import { Client, QueryResult } from "pg";
export class PgDriver extends BaseDriver<string, any[]> {
  private client: Client;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  protected async run(query: string): Promise<any[]> {
    const result: QueryResult = await this.client.query(query);
    return result.rows;
  }
}
