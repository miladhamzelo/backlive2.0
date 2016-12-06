import { BaseEvent, TypeOfBaseEvent, BaseEventCallback } from './base.event';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
//import 'rxjs/Rx';
import 'rxjs/add/operator/filter';

export class EventQueue {
    protected events: { [key: string]: Observable<BaseEvent<any>> } = {};
    protected activators: { [key: string]: Subject<BaseEvent<any>> } = {};
    protected subscribers: { [key: string]: { [key: string]: Subscription[] } } = {};

    constructor() {
    }
    
    subscribe<T extends BaseEvent<any>>(eventType: TypeOfBaseEvent<T>, subscriberId: number | string, callback: BaseEventCallback<T>, operators?: QueueOperators<T>) : Observable<T> {
        if(!eventType.eventName) {
            throw('The event does not have a name. Please remember to annotate your event with @AppEvent.');    
        }
        
        //console.log(eventType.eventName, 'subscribed to by ' + subscriberId);
        var eventName = eventType.eventName;
        var observable: Observable<T>;
        
        if (!this.events[eventName]) {
            this.events[eventName] = observable = Observable.create((observer: Observer<T>) => {
                if(!this.activators[eventName]) {
                    this.activators[eventName] = new Subject<T>();
                }
                
                this.activators[eventName].subscribe(observer);
            });
            
            this.subscribers[eventName] = {};
        }
        else {
            observable = this.events[eventName];
        }
        
        if (!this.subscribers[eventName][subscriberId]) {
            this.subscribers[eventName][subscriberId] = [];
        }

        if(operators) {
            for(var key in operators) {
                observable = observable[key](operators[key]);
            }
        }
        
        this.subscribers[eventName][subscriberId].push(observable.subscribe(event => {
            callback(event);
        }));

        return observable;
    }
    
    unsubscribe(subscriberId: any, eventType?: typeof BaseEvent) {
        if(eventType && this.subscribers[eventType.eventName] && this.subscribers[eventType.eventName][subscriberId]) {
            this.unsubscribeObservable(subscriberId, eventType.eventName);
        }
        else {
            for(var name in this.subscribers) {
                if(this.subscribers[name][subscriberId]) {
                    this.unsubscribeObservable(subscriberId, name);
                }
            }
        }
    }
    
    private unsubscribeObservable(subscriberId: any, eventName: string) {
        this.subscribers[eventName][subscriberId].forEach(subscription => {
            subscription.unsubscribe();    
        });
        
        delete this.subscribers[eventName][subscriberId];
    }

    notify(event: BaseEvent<any>) {
        var eventName = event.eventName;

        if (this.activators[eventName]) {
            setTimeout(() => {
                //console.log('EVENT: ' + eventName + ' fired');// with data', event.data);
                this.activators[eventName].next(event);
            });
        }
        else if(!event.isServer) {
            console.log('EVENT: ' + eventName + ' has no subscribers');
        }
    }
    
    clearEvent(eventName: string) {
        if (this.events[eventName]) {
            delete this.events[eventName];
            for(var name in this.activators) {
                this.activators[name].complete();
            }
            
            for(var name in this.subscribers) {
                for(var subscriberId in this.subscribers[name]) {
                    this.subscribers[name][subscriberId].forEach(subscriber => {
                       subscriber.unsubscribe(); 
                    });
                }
            }
        }
    }
}

export class QueueOperators<T extends BaseEvent<any>> {
    filter: (value: T, index: number) => boolean;
}