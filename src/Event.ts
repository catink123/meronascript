export interface MSEvent {
  detail?: any
}

export type MSEventListener = (e: MSEvent) => void;

export type MSEventType = 'stdout' | 'completed' | 'started';
