import { type EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { type EventName, type TiEvents, tiEvents } from '../events';
import { type EventPublisher, EventPublisherError } from './event-publisher';

export class EventBus implements EventPublisher {
  constructor(
    private readonly client: EventBridgeClient,
    private readonly eventBusName: string,
    private readonly source: string,
  ) {}

  async publish<TName extends EventName>(name: TName, detail: TiEvents[TName]): Promise<void> {
    try {
      const validDetail = tiEvents[name].parse(detail);
      const result = await this.client.send(
        new PutEventsCommand({
          Entries: [
            {
              EventBusName: this.eventBusName,
              Source: this.source,
              DetailType: name,
              Detail: JSON.stringify(validDetail),
            },
          ],
        }),
      );
      if (result.FailedEntryCount) {
        const entry = result.Entries?.[0];
        throw new Error(`PutEvents rejected the event: ${entry?.ErrorCode} ${entry?.ErrorMessage}`);
      }
    } catch (error) {
      console.error('[EventBus] failed to publish event', { eventName: name, eventBusName: this.eventBusName, error });
      throw new EventPublisherError(`Failed to publish ${name}`, { cause: error });
    }
  }
}
