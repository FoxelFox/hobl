import {createChart, ISeriesApi, Time} from 'lightweight-charts';
import {ChartSeries} from "./shared/interfaces";


export class Chart {

	areaSeries: {[key: string]: ISeriesApi<"Area", Time>} = {}
	candlestickSeries: {[key: string]: ISeriesApi<"Candlestick", Time>} = {}
	lineSeries: {[key: string]: ISeriesApi<"Candlestick", Time>} = {}
	chart

	constructor(id: string, data: ChartSeries) {
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
				vertLines: {color: '#444'},
				horzLines: {color: '#444'},
			},
			timeScale: {
				timeVisible: true,
				secondsVisible: true,
			},
		});

		if (data.areas) {
			for (const series of data.areas) {
				this.areaSeries[series.id] = this.chart.addAreaSeries({
					color: series.color,
					lineWidth: series.lineWidth,
					lineStyle: series.lineStyle
				});
			}
		}

		if (data.lines) {
			for (const series of data.lines) {
				this.lineSeries[series.id] = this.chart.addLineSeries({
					color: series.color,
					lineWidth: series.lineWidth,
					lineStyle: series.lineStyle,
					lastValueVisible: series.axisLabelVisible,
					priceLineVisible: series.axisLabelVisible
				});
			}
		}

		if (data.candles) {
			for (const series of data.candles) {
				this.candlestickSeries[series.id] = this.chart.addCandlestickSeries();
			}
		}

		this.update(data);
	}

	update(data: ChartSeries) {
		if (data.candles) {
			for (const series of data.candles) {
				for (const entry of series.data) {
					this.candlestickSeries[series.id].update(entry);
				}

				if (data.markers){
					const markers = this.candlestickSeries[series.id].markers();
					markers.push(...data.markers);
					this.candlestickSeries[series.id].setMarkers(markers);
				}

			}
		}

		if (data.areas) {
			for (const series of data.areas) {
				for (const entry of series.data) {
					this.areaSeries[series.id].update(entry);
				}
			}
		}

		if (data.lines) {
			for (const series of data.lines) {
				for (const entry of series.data) {
					this.lineSeries[series.id].update(entry);
				}
			}
		}
	}
}