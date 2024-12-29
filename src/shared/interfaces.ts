import {SeriesMarker, Time} from "lightweight-charts";

export interface TimeValue {
	time: string | Time
	value?: number
}

export interface Candle extends TimeValue {
	open: number
	high: number
	low: number
	close: number
	vwap: number
}

export interface ValueSeries {
	id: string
	data: TimeValue[]
	color?: string,
	lineWidth?: number,
	lineStyle?: number,
	axisLabelVisible?: boolean
}

export interface CandleSeries {
	id: string
	data: Candle[]
}

export interface ChartSeries {
	areas?:ValueSeries[]
	lines?: ValueSeries[]
	candles?: CandleSeries[]
	markers?: SeriesMarker<Time>[]
}