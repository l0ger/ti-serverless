import type { EventName, TiEvents } from '../events';

export interface EventPublisher {
  publish<TName extends EventName>(name: TName, detail: TiEvents[TName]): Promise<void>;
}

export class EventPublisherError extends Error {
  override readonly name = 'EventPublisherError';

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
