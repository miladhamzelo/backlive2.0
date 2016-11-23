//import { AppEvent, BaseEvent } from 'backlive/network/event';

import { AppEvent, BaseEvent } from '../../../network/event/base.event';
import { Indicator } from '../../../core/service/model/indicator.model';

@AppEvent('Event.Indicator.Update', true)
export class UpdateIndicatorEvent extends BaseEvent<Indicator> {}

@AppEvent('Event.Indicator.Remove', true)
export class RemoveIndicatorEvent extends BaseEvent<string> {}

interface ResponseEvent {
    res: () => void;
}