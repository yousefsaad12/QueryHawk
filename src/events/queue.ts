export class Queue<T> {
  private queryItems: T[] = [];
  private head: number = 0;

  public enqueue(queryContext: T) {
    this.queryItems.push(queryContext);
  }

  public dequeue(): T {
    if (this.isEmpty()) throw Error("Queue is empty");

    const item = this.queryItems[this.head++];

    if (this.head >= this.queryItems.length / 2) this.compact();

    return item;
  }

  private isEmpty(): boolean {
    return this.head >= this.queryItems.length;
  }
  private compact() {
    this.queryItems = this.queryItems.slice(this.head);
    this.head = 0;
  }
}
