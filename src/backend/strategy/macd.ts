import {Strategy} from "./strategy";
import {Broker} from "../broker";
import {Candle, CandleSeries, TimeValue} from "../../shared/interfaces";
import {SeriesMarker, Time} from "lightweight-charts";


export class Macd extends Strategy {


	macd: TimeValue[] = [];
	signal: TimeValue[] = [];
	stock: Candle[] = [];
	marker: SeriesMarker<Time>[] = [];

	s = 14;
	m = 7;

	min: number = Number.MAX_VALUE;
	max: number = 0;

	isMacdLong: boolean = false;
	isInvested: boolean = false;

	trailingStopLoss = 0.005;

	constructor(private symbol: string, broker: Broker) {
		super(broker);
	}


	tick(index: number, priceAction: RawPriceAction) {

		this.min = Math.min(this.min, priceAction.l);
		this.max = Math.max(this.max, priceAction.h);

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


		// MACD
		if (this.stock.length > 15) {
			if(macd < signal && !this.isMacdLong) {
				// BUY
				this.isMacdLong = true;
			}

			if (macd > signal && this.isMacdLong) {
				// SELL
				this.isMacdLong = false;
			}
		}

		// trailing stops
		if (this.isInvested) {
			const stopLoss = (this.min * (1 - this.trailingStopLoss))
			if (!this.isMacdLong || priceAction.h < stopLoss) {
				this.marker.push({
					time: (new Date(priceAction.t)).getTime() / 1000 as Time,
					color: '#FF0000',
					shape: 'arrowDown',
					text: `sell @ ${priceAction.vw}`,
					position: 'aboveBar'
				});

				if (!this.broker.sell(index, this.symbol, this.broker.positions[this.symbol])) {
					// sell failed
				}
				this.isInvested = false;
				this.resetStopLoss();
			}
		} else if (!this.isInvested) {
			if (this.isMacdLong) {
				this.marker.push({
					time: (new Date(priceAction.t)).getTime() / 1000 as Time,
					color: '#00FF00',
					shape: 'arrowUp',
					text: `buy @ ${priceAction.vw}`,
					position: 'belowBar'
				})


				if (!this.broker.buy(index, this.symbol, 100)) {
					// buy failed
				}

				this.isInvested = true;
				this.resetStopLoss();
			}
		}

		this.signal.push({
			time: (new Date(priceAction.t)).getTime() / 1000 as Time,
			value: macd
		});

		this.macd.push({
			time: (new Date(priceAction.t)).getTime() / 1000 as Time,
			value: signal
		});

		this.stock.push({
			time: (new Date(priceAction.t)).getTime() / 1000 as Time,
			open: priceAction.o,
			close: priceAction.c,
			low: priceAction.l,
			high: priceAction.h
		});
	}

	finish() {
		super.finish();
		this.isMacdLong = false;
		this.isInvested = false;
	}

	reset() {
		super.reset();
		this.macd.length = 0;
		this.signal.length = 0;
		this.stock.length = 0;
		this.marker.length = 0;
		this.resetStopLoss();
	}

	resetStopLoss() {
		this.min = Number.MAX_VALUE;
		this.max = 0;
	}

	tune() {
		this.s = Math.round(Math.random() * 200);
		this.m = Math.round(Math.random() * 200);
	}
}