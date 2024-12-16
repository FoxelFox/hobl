import {Strategy} from "./strategy";
import {Broker} from "../broker";
import {Candle, CandleSeries, TimeValue} from "../../shared/interfaces";
import {SeriesMarker} from "lightweight-charts";


export class Macd extends Strategy {


	signal: TimeValue[] = [];
	macd: { time: string, value: number }[] = [];
	stock: Candle[] = [];
	marker: SeriesMarker<string>[] = [];

	m = 100;
	s = 50;

	isLong: boolean = false;

	constructor(broker: Broker) {
		super(broker);
	}


	tick(priceAction: RawPriceAction) {

		let lastM: number, lastS: number;

		if (this.macd.length) {
			lastM = this.macd.at(-1).value;
			lastS = this.signal.at(-1).value;
		} else {
			lastM = priceAction.o;
			lastS = priceAction.o;
		}

		const macd = (lastM * this.m + priceAction.vw) / (this.m + 1);
		const signal = (lastS * this.s + priceAction.vw) / (this.s + 1);



		// actions
		if (this.stock.length > 15) {
			if(macd < signal && !this.isLong) {
				// BUY
				this.isLong = true;
				this.marker.push({
					time: priceAction.t,
					color: '#00FF00',
					shape: 'arrowUp',
					text: `buy @ ${priceAction.vw}`,
					position: 'belowBar'
				})
			}

			if (macd > signal && this.isLong) {
				// SELL
				this.isLong = false;
				this.marker.push({
					time: priceAction.t,
					color: '#FF0000',
					shape: 'arrowDown',
					text: `sell @ ${priceAction.vw}`,
					position: 'aboveBar'
				})
			}
		}

		this.macd.push({
			time: priceAction.t,
			value: macd
		});

		this.signal.push({
			time: priceAction.t,
			value: signal
		});

		this.stock.push({
			time: priceAction.t,
			open: priceAction.o,
			close: priceAction.c,
			low: priceAction.l,
			high: priceAction.h
		});


	}




	tune() {

	}
}