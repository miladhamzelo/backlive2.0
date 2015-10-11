var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var angular2_1 = require('angular2/angular2');
var base_1 = require('../shared/base');
var app_1 = require('../../service/app');
var PortfolioComponent = (function (_super) {
    __extends(PortfolioComponent, _super);
    function PortfolioComponent(app) {
        _super.call(this, app);
    }
    PortfolioComponent = __decorate([
        angular2_1.Component({
            selector: 'portfolio'
        }),
        angular2_1.View({
            templateUrl: '/view/portfolio/portfolio.html'
        }), 
        __metadata('design:paramtypes', [app_1.AppService])
    ], PortfolioComponent);
    return PortfolioComponent;
})(base_1.BaseComponent);
exports.PortfolioComponent = PortfolioComponent;
//# sourceMappingURL=portfolio.js.map