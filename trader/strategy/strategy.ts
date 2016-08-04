import {EventQueue} from '../lib/events/event-queue';
import {AppEventQueue} from '../lib/events/app-event-queue';
import {DataEvent, DataSubscriptionEvent} from '../lib/events/trader-event';
import {IDataHandler} from '../data-handler/data-handler';

import {Strategy as StrategyModel, Operator, Indicator, Param} from 'backlive/service/model';
import {Common} from 'backlive/utility';

export class Strategy extends EventQueue {
    allIndicators: Indicator[];
    
    constructor(private model: StrategyModel) {
        super();
        this.allIndicators = model.indicators.long.concat(model.indicators.short, model.exposure.long, model.exclusions);
        
        AppEventQueue.subscribe(this, new DataEvent(), (event: DataEvent) => this.processData(event));
        AppEventQueue.notify(new DataSubscriptionEvent(this.getIndicatorParams()));
    }
    
    processData(data: DataEvent) {
        console.log(data);
    }
    
    getIndicatorParams(): Param[] {
        var params: [number, string][] = [];
        
        this.allIndicators.forEach(indicator => {
            this.getIndicatorParamsHelper(indicator, params);
        });
        
        return params;
    }

    private getIndicatorParamsHelper(indicator: Indicator, params: Param[]) {
        for(var i = 0, cnt = indicator.vars.length; i < cnt; i++) {
			var obj = indicator.vars[i];
			
			if(obj) {
				if(Common.isObject(obj)) {
                    this.getIndicatorParamsHelper(<Indicator> obj, params);
                }
                else {
					var type: number = parseInt(obj[0]);
					var field: string = obj[1];
					params.push([type, field]);					
				}
			}
		}
    }
    
    getModel() {
        return this.model;
    }
    
}