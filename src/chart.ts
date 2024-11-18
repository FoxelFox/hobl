import { createChart } from 'lightweight-charts';

export class Chart {

    constructor() {
        const chart = createChart(document.getElementById('chart')!);

        const areaSeries = chart.addAreaSeries();
        areaSeries.setData([
            // ... other data items
            { time: '2018-12-31', value: 22.67 },
        ]);

        const candlestickSeries = chart.addCandlestickSeries();
        candlestickSeries.setData([
            // ... other data items
            { time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
        ]);

        // sometime later

        // update the most recent bar
        areaSeries.update({ time: '2018-12-31', value: 25 });
        candlestickSeries.update({ time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 112 });

        // creating the new bar
        areaSeries.update({ time: '2019-01-01', value: 20 });
        candlestickSeries.update({ time: '2019-01-01', open: 112, high: 112, low: 100, close: 101 });
    }

}