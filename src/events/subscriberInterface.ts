import { QueryContext } from "../context/query.context";

export interface Subscriber {
  handle(event: QueryContext): void | Promise<void>;
}