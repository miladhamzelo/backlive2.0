declare var Appcues: any;
declare var __insp: any;
declare var ga: any;
declare var SnapEngage: any, SnapABugChat: any, SnapABug: any;

import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { RouterService } from './router.service';
import { AnalyticsDimension, AnalyticsEvent, AnalyticsTiming, AnalyticsEventCategory, AnalyticsEventAction, AnalyticsTimingVar } from './model/analytics.model';

import { User } from 'backlive/service/model';

import { PlatformUI } from 'backlive/utility/ui';

declare var System: any;
declare var WEB_CONFIG: any;

@Injectable()
export class AnalyticsService {
    user: User;
    static gaTrackerName: string = null;

    constructor(private appService: AppService, private platformUI: PlatformUI) {
    }
    
    initialize(user: User) {
        this.user = user;

        this.initGoogleAnalytics(user);

        this.appService.routerService.subscribeToUrl((path, currentParams) => this.setPageView(path, currentParams));
    }
    
    setPageView(path: string, params: { [key: string]: any } = {}) {
        if (AnalyticsService.gaEnabled()) {
            var customDimensions;
            
            ga(AnalyticsService.trackerFn('set'), 'page', path);
            ga(AnalyticsService.trackerFn('send'), 'pageview', customDimensions);
        }
    }
    
    static trackEvent(event: AnalyticsEvent, customDimensions: {} = null) {
        if (this.gaEnabled()) {
            var hit = {
                hitType: 'event',
                eventCategory: event.category,
                eventAction: event.action,
                eventLabel: JSON.stringify({
                    url: RouterService.activeUrl,
                    description: event.label
                }),
                eventValue: event.value
            }
            
            AnalyticsService.trackHit(hit, customDimensions);
        }
    }
    
    static trackTiming(event: AnalyticsTiming, customDimensions: {} = null) {
        if (this.gaEnabled()) {
            var hit = {
                hitType: 'timing',
                timingCategory: event.category,
                timingVar: event.variable,
                timingValue: event.value,
                timingLabel: event.label
            };
            
            AnalyticsService.trackHit(hit, customDimensions);
            AnalyticsService.trackEvent({ category: event.category, action: event.variable, label: event.label, value: event.value }, customDimensions);
        }
    }
    
    private static trackHit(hit: {}, customDimensions: {} = null) {
        if(customDimensions) {
            for(var key in customDimensions) {
                hit[key] = customDimensions[key];
            }
        }
        
        ga(AnalyticsService.trackerFn('send'), hit);
    }
    
    private static trackerFn(fnName: string) {
        return AnalyticsService.gaTrackerName ? `${AnalyticsService.gaTrackerName}.${fnName}` : fnName;
    }

    static gaEnabled() {
        return typeof (ga) !== 'undefined';
    }

    private initGoogleAnalytics(user: User) {
        if (AnalyticsService.gaEnabled()) {
            ga(() => {
                var trackers = ga.getAll();
                if (trackers.length > 0) {
                    AnalyticsService.gaTrackerName = trackers[0].get('name');
                }

                ga(AnalyticsService.trackerFn('set'), 'userId', user.username);
                ga(AnalyticsService.trackerFn('set'), AnalyticsDimension.userId, user.username);
            });
        }
    }
}