import { QueryContext } from "../context/query.context";
import { Queue } from "./queue";

export class EventBus {
  private queue: Queue<QueryContext>;

  constructor(queue: Queue<QueryContext>) {
    this.queue = queue;
  }

  publish(event: QueryContext): void {
    this.queue.enqueue(event);
  }
}