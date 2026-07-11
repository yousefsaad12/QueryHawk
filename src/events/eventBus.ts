import { QueryContext } from "../context/query.context";
import { Queue } from "./queue";
import { QueueError } from "../errors/query.errors";

export class EventBus {
  private queue: Queue<QueryContext>;

  constructor(queue: Queue<QueryContext>) {
    this.queue = queue;
  }

  publish(event: QueryContext): void {
    try {
      this.queue.enqueue(event);
    } catch (error) {
      if (error instanceof QueueError) {
        console.error('Failed to publish event to queue:', error.message);
      } else {
        console.error('Unexpected error publishing event:', error);
      }
      throw error;
    }
  }
}