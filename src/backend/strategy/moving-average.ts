import {Strategy} from "./strategy";
import {Broker} from "../broker";
import {Candle, CandleSeries, TimeValue} from "../../shared/interfaces";
import {SeriesMarker, Time} from "lightweight-charts";


export class MovingAverage extends Strategy {


	slow: TimeValue[] = [];
	fast: TimeValue[] = [];
	stock: Candle[] = [];
	marker: SeriesMarker<Time>[] = [];

	s = 14;
	f = 7;

	min: number = Number.MAX_VALUE;
	max: number = 0;

	isLong: boolean = false;
	isInvested: boolean = false;
	buyNow: boolean = false;
	trailingPStopProfit = 0.01;
	trailingStopLoss = 0.01;
	buyIn: number = 0;

	constructor(private symbol: string, broker: Broker) {
		super(broker);
	}


	tick(index: number, priceAction: RawPriceAction) {

		this.min = Math.min(this.min, priceAction.vw);
		this.max = Math.max(this.max, priceAction.vw);

		let lastM: number, lastS: number;

		if (this.fast.length) {
			lastM = this.fast.at(-1).value;
			lastS = this.slow.at(-1).value;
		} else {
			lastM = priceAction.o;
			lastS = priceAction.o;
		}

		const slow = (lastM * this.s + priceAction.vw) / (this.s + 1);
		const fast = (lastS * this.f + priceAction.vw) / (this.f + 1);


		if (this.stock.length > 15) {
			if(slow < fast && !this.isLong) {
				// BUY
				this.isLong = true;
				this.buyNow = true;
			}

			if (slow > fast && this.isLong) {
				// SELL
				this.isLong = false;
			}
		}

		// trailing stops
		if (this.isInvested && !this.buyNow) {
			const stopProfit = (this.max * (1 - this.trailingPStopProfit))
			const stopLoss = (this.min * (1 - this.trailingStopLoss))
			if (this.buyIn > stopLoss || priceAction.vw < stopProfit) {
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
				this.buyIn = 0; // TODO multiple buys ???
				this.isInvested = false;
				this.resetStopLoss();
			}
		}
		if (!this.isInvested && this.buyNow) {
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


			this.buyIn = priceAction.vw; // TODO multiple buys ???
			this.isInvested = true;
			this.resetStopLoss();
		}

		this.fast.push({
			time: (new Date(priceAction.t)).getTime() / 1000 as Time,
			value: slow
		});

		this.slow.push({
			time: (new Date(priceAction.t)).getTime() / 1000 as Time,
			value: fast
		});

		this.stock.push({
			time: (new Date(priceAction.t)).getTime() / 1000 as Time,
			open: priceAction.o,
			close: priceAction.c,
			low: priceAction.l,
			high: priceAction.h
		});

		this.buyNow = false;
	}

	finish() {
		super.finish();
		this.isLong = false;
		this.isInvested = false;
	}

	reset() {
		super.reset();
		this.slow.length = 0;
		this.fast.length = 0;
		this.stock.length = 0;
		this.marker.length = 0;
		this.resetStopLoss();
	}

	resetStopLoss() {
		this.min = Number.MAX_VALUE;
		this.max = 0;
		this.buyIn = 0;
	}

	tune() {
		this.s = Math.round(Math.random() * 200);
		this.f = Math.round(Math.random() * 200);
	}
}