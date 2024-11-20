import { createChart } from 'lightweight-charts';
import {Price} from "./api.ts";

export class Chart {

    candlestickSeries
    chart

    constructor(private id: string) {
        this.chart = createChart(document.getElementById(id)!, {
            autoSize: true,
            layout: {
                background: {color: "#222"},
                textColor: '#DDD',
            },
            grid: {
                vertLines: { color: '#444' },
                horzLines: { color: '#444' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        //const areaSeries = chart.addAreaSeries({});
        // areaSeries.setData([
        //     // ... other data items
        //     { time: '2018-12-31', value: 22.67 },
        // ]);

        this.candlestickSeries = this.chart.addCandlestickSeries();
        // candlestickSeries.setData([
        //     // ... other data items
        //     { time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
        // ]);

    }

    update(data: Price[]) {
        for(const entry of data) {
            this.candlestickSeries.update(entry);

            // is this needed?
            this.chart.timeScale().fitContent();
        }
    }
}