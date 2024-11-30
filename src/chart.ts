import { createChart } from 'lightweight-charts';
import {BasicPrice, Price} from "./api";

export class Chart {

    areaSeries
    candlestickSeries
    chart

    min = Number.MAX_VALUE
    max = Number.MIN_VALUE

    constructor(private id: string) {
        this.chart = createChart(document.getElementById(id)!, {
            watermark: {
                visible: true,
                text: id,
                fontSize: 24,
                horzAlign: 'center',
                vertAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
            },
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

        this.areaSeries = this.chart.addAreaSeries();

        this.candlestickSeries = this.chart.addCandlestickSeries();
        // candlestickSeries.setData([
        //     // ... other data items
        //     { time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
        // ]);

    }

    update(data: Price[]) {
        for(const entry of data) {
            this.min = Math.min(this.min, entry.low);
            this.max = Math.min(this.max, entry.high);
            this.candlestickSeries.update(entry);

            // is this needed?

        }
    }

    drawPrediction(data: BasicPrice[]) {
        this.areaSeries.setData(data);
    }
}