export interface MSEvent {
  detail?: any
}

export type MSEventListener = {type: MSEventType, callback: MSEventListenerCallback};

export type MSEventListenerCallback = (e: MSEvent) => void;

export type MSEventType = 'stdout' | 'completed' | 'started';
