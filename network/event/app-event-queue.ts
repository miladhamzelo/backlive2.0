import { EventQueue, QueueOperators } from './event-queue';
import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from './base.event';

export class AppEventQueue {
    private static eventQueue: EventQueue;
    
    static global() {
        AppEventQueue.eventQueue = new EventQueue();

        process.on('message', (event: BaseEvent<any>) => {
            //console.log('network - from parent process', event);
            AppEventQueue.notify(event, true);
        });
    }
    
    static subscribe<T extends BaseEvent<any>>(eventType: TypeOfBaseEvent<T>, subscriberId: string, callback: BaseEventCallback<T>, operators?: QueueOperators<T>) {
        return AppEventQueue.eventQueue.subscribe(eventType, subscriberId, callback, operators);
    }

    static unsubscribe<T extends BaseEvent<any>>(subscriberId: string, eventType: TypeOfBaseEvent<T>) {
        return AppEventQueue.eventQueue.unsubscribe(subscriberId, eventType);
    }
    
    static notify(event: BaseEvent<any>, fromClient: boolean = false) {
        AppEventQueue.eventQueue.notify(event);

        if(!fromClient && event.isSocketEvent) {
            process.send(event);
        }
    }
}