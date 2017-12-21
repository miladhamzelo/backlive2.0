import { Component, Input, Output, ElementRef, AfterViewInit, EventEmitter, NgZone } from '@angular/core';

import { BaseComponent } from '../base.component';
import { AppService } from 'backlive/service';
import { Common } from 'backlive/utility';
import { PlatformUI } from 'backlive/utility/ui';

declare var Highcharts;

@Component({
    selector: 'backlive-chart',
    template: `<div class="chart"></div>`,
    styles: [`
        .chart {
            width: 100%;
            height: 100%;
        }
    `]
})
export class ChartComponent extends BaseComponent implements AfterViewInit {
    @Input() options: ChartOptions;
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();

    chart: any;
    private highChartOptions: any;

    selectedBarCategory: number = 0;
    selectedBarCategoryArray: number[] = [];
    isSliced: boolean = false;
    isRemoved: boolean;
    isArrayEmpty: boolean;

    constructor(appService: AppService, private platformUI: PlatformUI, private elementRef: ElementRef, private ngZone: NgZone) {
        super(appService);

        Highcharts.setOptions({
            lang: { thousandsSep: ',' }
        });

        /*if (Highcharts.getOptions().exporting) {
            let contextButton = Highcharts.getOptions().exporting.buttons.contextButton;
            var includedItems = ['printChart', 'downloadCSV'];
            contextButton.menuItems = contextButton.menuItems.filter((item) => {
                return includedItems.indexOf(item.textKey) > -1;
            });
        }*/
    }

    ngAfterViewInit() {
        this.chart = this.platformUI.query(this.elementRef.nativeElement).find('.chart').highcharts('StockChart', this.buildChartOptions()).highcharts();
    }

    buildChartOptions() {
        var self = this;
        this.highChartOptions = {
            chart: {
                type: this.options.type,
                options3d: { enabled: !this.options.disable3d, alpha: 0, beta: 0, depth: 20, viewDistance: 25 },
                //events: this.chartEventHandlers(),
                borderWidth: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                events: {
                    load: function() {
                        this.series.forEach(series => {
                            if(series.visible) {
                                setTimeout(function() {
                                    self.setExtremes('yAxis', series.dataMin, series.dataMax);
                                });
                            }
                        });
                    }
                }
            },
            plotOptions: {
                series: {
                    fillOpacity: 0.3,
                    events: {
                        show: function() {
                            if(!this.options.multipleSeries) {
                                for (var i = 0, series; series = this.chart.series[i]; i++) {
                                    if(series != this && series.visible) {
                                        series.hide();
                                    }
                                }

                                setTimeout(() => {
                                    self.setExtremes('yAxis', this.dataMin, this.dataMax);
                                });
                            }
                        },
                        legendItemClick: function () {
                            if (!this.options.multipleSeries && this.visible) {
                                return false;
                            }
                        }
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                style: {
                    color: '#F0F0F0'
                }
            },
            toolbar: {
                itemStyle: {
                    color: 'silver'
                }
            },
            credits: { enabled: false },
            legend: { enabled: true, itemStyle: { color: '#fff' } },
            navigator: { enabled: false },
            rangeSelector: {
                buttonTheme: {
                    fill: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0.4, '#555'],
                            [0.6, '#222']
                        ]
                    },
                    stroke: '#000000',
                    style: {
                        color: '#CCC',
                        fontWeight: 'bold'
                    },
                    states: {
                        hover: {
                            fill: {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [
                                    [0.4, '#777'],
                                    [0.6, '#444']
                                ]
                            },
                            stroke: '#000000',
                            style: {
                                color: 'white'
                            }
                        },
                        select: {
                            fill: {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [
                                    [0.1, '#333'],
                                    [0.3, '#111']
                                ]
                            },
                            stroke: '#000000',
                            style: {
                                color: '#ff9900'
                            }
                        }
                    }
                },
                inputStyle: {
                    backgroundColor: '#333',
                    color: 'silver'
                },
                labelStyle: {
                    color: 'silver'
                }
            }
        };

        if (this.options.title) {
            this.highChartOptions.title = { text: this.options.title, style: { color: '#fff' } };
        }
        else {
            this.highChartOptions.title = null;
        }

        if (this.options.subtitle) {
            this.highChartOptions.subtitle = { text: this.options.subtitle };
        }

        if (this.options.colors) {
            this.highChartOptions.colors = this.options.colors;
        }

        if (this.options.type === ChartType.pie || this.options.type === ChartType.donut) {
            this.highChartOptions.legend.enabled = false;
            this.buildPieChart();
        }

        if (this.options.disableExporting) {
            this.highChartOptions.exporting = { enabled: false };
        }

        //format data
        if(Common.isArray(this.options.series[0].data)) {
            /*this.options.series.forEach(series => {
                if(series.data[1]) {
                    var data = <[number, number]>series.data;
                    for(var i = 0, d: [number, number]; d = series.data[i]; i++) {
                        this.setMinMaxVal(series, d[1]);
                    }
                }

                if(series.visible) console.log(series)
            });*/
        }
        else if (Common.isObject(this.options.series[0].data)) { //data is in KeyValue pair format, so convert
            if (!this.options.xAxis) {
                this.options.xAxis = {};
            }

            var results = this.dataFromKeyValueSeries(this.options.series);
            this.options.xAxis.categories = results.categories;
            this.options.series = results.series;
        }

        //build axis
        this.highChartOptions.series = this.options.series;
        this.buildAxisOptions('xAxis');
        this.buildAxisOptions('yAxis');

        return this.highChartOptions;
    }

    buildPieChart() {
        var self = this;
        this.highChartOptions.chart.options3d = { enabled: true, alpha: 30 };
        this.highChartOptions.plotOptions.pie = { cursor: 'pointer', allowPointSelect: true, depth: 45, showInLegend: true };

        if (this.options.type === ChartType.donut) {
            this.highChartOptions.chart.type = ChartType.pie;
            this.highChartOptions.plotOptions.pie.innerSize = 100;
        }

        if (this.options.disableDatalabels) {
            this.highChartOptions.plotOptions.pie = { allowPointSelect: false };
            this.highChartOptions.plotOptions.pie.dataLabels = { enabled: false };
            this.highChartOptions.plotOptions.pie.innerSize = 100;
        }
    }

    buildAxisOptions(axis: string) {
        var self = this;

        if (!this.options[axis]) {
            this.options[axis] = {};
        }

        this.highChartOptions[axis] = {
            type: this.options[axis].type,
            title: this.options[axis].title,
            gridLineWidth: 0
        };

        if (this.options[axis].categories) {
            this.highChartOptions[axis].categories = this.options[axis].categories;
        }

        if (this.options[axis].dateFormat) {
            this.highChartOptions[axis].labels = { format: '{value:' + this.options[axis].dateFormat + '}' };

            if (Highcharts.getOptions().exporting) {
                Highcharts.getOptions().exporting.csv = { dateFormat: this.options[axis].dateFormat };
            }
        }

        if (this.highChartOptions[axis].labels) {
            this.highChartOptions[axis].labels.style = { color: '#fff' };
        }
        else {
            this.highChartOptions[axis].labels = { style: { color: '#fff' } };
        }

        if (axis === 'xAxis') {
            /*this.highChartOptions.tooltip = {
                formatter: function () {
                    if (self.options.disableDatalabels) {
                        return `<span style="font-size:9px">${self.formatValueX(this.x || this.point.name)}</span>`
                            + `<br/><span style="color:${this.series.color || this.point.color}">\u25CF </span><b>${self.formatValueY(this.y)}</b>`;
                    }
                    else {
                        return `<span style="font-size:9px">${self.formatValueX(this.x || this.point.name)}</span>`
                            + `<br/><span style="color:${this.series.color || this.point.color}">\u25CF</span> ${this.series.options.tooltipLabel || this.series.name}: <b>${self.formatValueY(this.y)}</b>`;
                    }
                }
            };*/

            this.highChartOptions.legend.labelFormatter = function () {
                return this.options.labels && this.options.labels[this.name] ? this.options.labels[this.name] : this.name;
            };
        }

        if (axis === 'yAxis' && this.options.type === ChartType.column) {
            this.highChartOptions[axis].allowDecimals = this.options[axis].allowDecimals;
        }
    }

    private dataFromKeyValueSeries(series: ChartSeries[]): { categories: string[], series: ChartSeries[] } {
        var outputSeries: ChartSeries[] = [];
        var categories: string[] = [];

        var usedCategories = {};
        var categoriesIndex = {};
        var iterator = 0;
        var nextIndex = 0;

        for (var i = 0, s: ChartSeries; s = series[i]; i++) {
            //var newSeries: ChartSeries = { name: s.name, data: [], tooltipLabel: s.tooltipLabel, labels: s.labels };
            var newSeries: ChartSeries = { data: [] };
            for(var key in s) {
                if(key !== 'data') {
                    newSeries[key] = s[key];
                }
            }

            for (var key in s.data) {
                if (this.highChartOptions.chart.type === ChartType.pie) {
                    (<ChartDataPoint[]>newSeries.data).push({ name: key, y: s.data[key] });
                }
                else {
                    if (!usedCategories[key]) {
                        categories.push(key);
                        categoriesIndex[key] = nextIndex++;
                        usedCategories[key] = true;
                    }

                    newSeries.data[categoriesIndex[key]] = s.data[key];
                    //this.setMinMaxVal(newSeries, s.data[key]);
                }
            }

            outputSeries.push(newSeries);
        }

        return { categories: categories, series: outputSeries };
    }

    formatValueX(x: string) {
        return this.options.xAxis && this.options.xAxis.dateFormat ? Highcharts.dateFormat(this.options.xAxis.dateFormat, new Date(parseInt(x))) : x;
    }

    formatValueY(y: number) {
        return (this.options.yAxis && this.options.yAxis.type === ChartAxisType.currency ? '$' : '') + Highcharts.numberFormat(y, null, null, ',');
    }

    addPoint(seriesName: string, point: [number, number]) {
        if (this.chart && this.chart.series) {
            for (var i = 0, series; series = this.chart.series[i]; i++) {
                if (series.name === seriesName) {
                    series.addPoint(point);

                    if (series.visible) {
                        this.setExtremes('yAxis', series.dataMin, series.dataMax);
                    }
                }
            }
        }
    }

    setExtremes(axis: string, min: number, max: number) {
        if(typeof min !== 'undefined' && typeof max !== 'undefined') {
            this.chart[axis][0].setExtremes(min - (min * .0001), max + (max * .0001));
        }
    }
}

export interface ChartOptions {
    type: string;
    series: ChartSeries[];
    title?: string;
    subtitle?: string;
    xAxis?: ChartAxis;
    yAxis?: ChartAxis;
    colors?: string[];
    plotOptions?: string[];
    multipleSeries?: boolean;
    disable3d?: boolean;
    disableDatalabels?: boolean;
    disableExporting?: boolean;
}

export interface ChartAxis {
    title?: string;
    type?: string;
    categories?: string[];
    dateFormat?: string;
    allowDecimals?: boolean;
}

export class ChartAxisType {
    static datetime: string = 'datetime';
    static currency: string = 'currency';
}

export interface ChartSeries {
    name?: string;
    data: ChartData;
    tooltipLabel?: string;
    labels?: { [key: string]: string };
    visible?: boolean;
    color?: string; 
}

declare type ChartData = number[] | [number | string, number][] | ChartDataPoint[] | ChartKeyValueData;

export interface ChartDataPoint {
    name?: string;
    y?: number;
    color?: string;
    sliced?: boolean;
    selected?: boolean;
}

export interface ChartKeyValueData {
    [key: string]: number;
}

export class ChartType {
    static column: string = 'column';
    static line: string = 'line';
    static area: string = 'area';
    static pie: string = 'pie';
    static donut: string = 'donut';
}