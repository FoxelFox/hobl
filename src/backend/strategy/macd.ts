import {Strategy} from "./strategy";
import {Broker} from "../broker";
import {Candle, CandleSeries, TimeValue} from "../../shared/interfaces";
import {SeriesMarker} from "lightweight-charts";


export class Macd extends Strategy {


	macd: TimeValue[] = [];
	signal: { time: string, value: number }[] = [];
	stock: Candle[] = [];
	marker: SeriesMarker<string>[] = [];

	s = 14;
	m = 7;

	isLong: boolean = false;

	constructor(private symbol: string, broker: Broker) {
		super(broker);
	}


	tick(index: number, priceAction: RawPriceAction) {

		let lastM: number, lastS: number;

		if (this.signal.length) {
			lastM = this.signal.at(-1).value;
			lastS = this.macd.at(-1).value;
		} else {
			lastM = priceAction.o;
			lastS = priceAction.o;
		}

		const macd = (lastM * this.s + priceAction.vw) / (this.s + 1);
		const signal = (lastS * this.m + priceAction.vw) / (this.m + 1);


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


				if (!this.broker.buy(index, this.symbol, 100)) {
					// buy failed
				}
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
				});

				if (!this.broker.sell(index, this.symbol, this.broker.positions[this.symbol])) {
					// sell failed
				}
			}
		}

		this.signal.push({
			time: priceAction.t,
			value: macd
		});

		this.macd.push({
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

	finish() {
		super.finish();
		this.isLong = false;
	}

	reset() {
		super.reset();
		this.macd.length = 0;
		this.signal.length = 0;
		this.stock.length = 0;
		this.marker.length = 0;
	}

	tune() {
		this.s = Math.round(Math.random() * 200);
		this.m = Math.round(Math.random() * 200);
	}
}