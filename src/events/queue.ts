import { QueueError } from "../errors/query.errors";

export class Queue<T> {
  private queryItems: T[] = [];
  private head: number = 0;

  public enqueue(item: T) {
    this.queryItems.push(item);
  }

  public dequeue(): T {
    if (this.isEmpty()) throw new QueueError("Queue is empty");

    const item = this.queryItems[this.head++];

    if (this.head >= this.queryItems.length / 2) this.compact();

    return item;
  }

  public isEmpty(): boolean {
    return this.head >= this.queryItems.length;
  }
  private compact() {
    this.queryItems = this.queryItems.slice(this.head);
    this.head = 0;
  }
}
