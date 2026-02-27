declare module "@rails/actioncable" {
  export function createConsumer(url?: string): Cable
  interface Cable {
    subscriptions: Subscriptions
    disconnect(): void
  }
  interface Subscriptions {
    create(channel: string | object, mixin?: object): Subscription
  }
  interface Subscription {
    send(data: object): void
    unsubscribe(): void
  }
}
