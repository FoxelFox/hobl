import {Time} from "lightweight-charts";

export interface TimeValue {
	time: string | Time
	value: number
}

export interface Candle extends TimeValue {
	open: number
	high: number
	low: number
	close: number
}

export interface ChartSeries {
	areas?: {
		id: string
		data: TimeValue[]
	}[]
	candles?: {
		id: string
		data: Candle[]
	}[]
}