import { BaseController, Get, Post, Delete } from './base.controller';
import { StrategyService } from '../service/strategy.service';

export class StrategyController extends BaseController {
	constructor() {
		super({ strategyService: StrategyService });
	}

	@Get('')
	stategies(req, res) {
        res.services.strategyService.getStrategies().done(function(strategies) {
			res.send(strategies);
		});
	}
	
	@Get('backtests')
	backtests(req, res) {
        res.services.strategyService.getBacktests().done(function(strategies) {
			res.send(strategies);
		});
	}
    
	@Post('returns')
    getReturns(req, res) {
        res.services.strategyService.getReturns(req.body.strategyIds, req.body.startDate, req.body.endDate).done(function(strategy) {
			res.send(strategy);
		});
	}

	@Post(':backtestId')
    saveBacktest(req, res) {
        res.services.strategyService.saveBacktest(req.params.backtestId, req.body.name).done(function(strategy) {
			res.send(strategy);
		});
	}
    
	@Delete(':backtestId')
    removeBacktest(req, res) {
        res.services.strategyService.removeBacktest(req.params.backtestId).done(function(data) {
			res.send(data);
		});
	}
    
	@Post(':backtestId/share')
    shareBacktest(req, res) {
        res.services.strategyService.shareBacktest(req.params.backtestId, req.body.username, req.body.isPublic).done(function(data) {
			res.send(data);
		});
	}
    
	@Get(':backtestId/automate')
    getAutomatedStrategy(req, res) {
        res.services.strategyService.getAutomatedStrategy(req.params.backtestId).done(function(data) {
			res.send(data);
		});
	}
    
	@Post(':backtestId/automate')
    automateStrategy(req, res) {
        res.services.strategyService.automateStrategy(req.params.backtestId, req.body.startCapital).done(function(data) {
			res.send(data);
		});
	}
    
	@Delete(':backtestId/automate')
    stopAutomation(req, res) {
        res.services.strategyService.stopAutomation(req.params.backtestId).done(function(res) {
			res.send(res);
		});
	}
    
	@Delete(':backtestId/executed')
    markStrategyAsExecuted(req, res) {
        res.services.strategyService.markStrategyAsExecuted(req.params.backtestId, req.body.date).done(function(res) {
			res.send(res);
		});
	}
}