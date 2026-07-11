import { QueryContext } from "../context/query.context";
import { Queue } from "./queue";
import { Subscriber } from "./subscriber.interface";

export class Dispatcher {
  private subscribers: Subscriber[] = [];
  private running: boolean = false;
  constructor(private queue: Queue<QueryContext>) {}

  public start(): void {
    this.running = true;
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (!this.running) return;

    if (!this.queue.isEmpty()) {
      const event = this.queue.dequeue();
      await this.dispatchToSubscribers(event);
    }

    setImmediate(() => this.processNext());
  }

  public subscribe(subscriber: Subscriber): void {
    this.subscribers.push(subscriber);
  }

  public stop(): void {
    this.running = false;
  }
  private async dispatchToSubscribers(event: QueryContext): Promise<void> {
    for (const subscriber of this.subscribers) {
      try {
        await subscriber.handle(event);
      } catch (error) {
        console.error(
          `Subscriber '${subscriber.constructor.name}' failed:`,
          error,
        );
      }
    }
  }
}
