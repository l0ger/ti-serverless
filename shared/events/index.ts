import { personEvents, type PersonEvents } from './person';

export * as Person from './person';

export const tiEvents = {
  ...personEvents,
} as const;

export type TiEvents = PersonEvents;

export type EventName = keyof TiEvents;
