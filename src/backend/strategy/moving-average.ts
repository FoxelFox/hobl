import {Strategy} from "./strategy";
import {Broker} from "../broker";
import {Candle, CandleSeries, TimeValue} from "../../shared/interfaces";
import {SeriesMarker, Time} from "lightweight-charts";
import {EventSystem} from "../../shared/event-system";
import {inject} from "../../shared/injector";


export class MovingAverage extends Strategy {


	fast: TimeValue[] = [];
	slow: TimeValue[] = [];
	stock: Candle[] = [];
	marker: SeriesMarker<Time>[] = [];

	s = 14;
	f = 7;
	minPriceVolume = 1;

	min: number = Number.MAX_VALUE;
	max: number = 0;

	isLong: boolean = false;
	isInvested: boolean = false;
	buyNow: boolean = false;
	stopProfit = 0.01;
	stopLoss = 0.01;
	limitProfit = 1;
	buyIn: number = 0;
	lastTradedDay: string;

	startH: number;
	startM: number;

	eventSystem = inject(EventSystem);

	constructor(private symbol: string, broker: Broker) {
		super(broker);

		this.eventSystem.register(symbol, (data: {index: number, priceAction: RawPriceAction}) => {
			console.log("Event Update", data.index, data.priceAction.vw);
			this.tick(data.index, data.priceAction);
		});
	}

	tick(index: number, priceAction: RawPriceAction) {

		this.stock.push({
			time: (new Date(priceAction.t)).getTime() / 1000 as Time,
			open: priceAction.o,
			close: priceAction.c,
			low: priceAction.l,
			high: priceAction.h,
			vwap: priceAction.vw,
			volume: priceAction.v * priceAction.vw
		});

		const time = new Date(priceAction.t);
		const day = priceAction.t.split('T')[0];
		const investedAllowedByTime = (time.getUTCHours() > this.startH || (time.getUTCHours() === this.startH && time.getUTCMinutes() > this.startM)) && (time.getUTCHours() < 20 || (time.getUTCHours() == 20 && time.getUTCMinutes() < 45));

		if (this.stock.length < this.s || this.stock.length < this.f ) {
			return
		}

		this.min = Math.min(this.min, priceAction.vw);
		this.max = Math.max(this.max, priceAction.vw);

		let fast = 0;
		for (let i = this.stock.length - this.f, l = this.stock.length; i < l; ++i) {
			fast += this.stock[i].vwap
		}
		fast = fast / this.f;

		let slow = 0;
		for (let i = this.stock.length - this.s, l = this.stock.length; i < l; ++i) {
			slow += this.stock[i].vwap
		}
		slow = slow / this.s;

		if (this.stock.length > 15) {
			if(slow < fast && fast < priceAction.vw && !this.isLong && this.lastTradedDay !== day) {
				// BUY
				this.isLong = true;
				this.buyNow = true;
			}

			if (slow > fast && fast > priceAction.vw && this.isLong) {
				// SELL
				this.isLong = false;
			}
		}

		// trailing stops
		const stopProfit = (this.max * (1 - this.stopProfit))
		const stopLoss = (this.buyIn * (1 - this.stopLoss))

		if (this.isInvested && investedAllowedByTime && !this.isLong) {
			if (priceAction.vw < stopLoss || priceAction.vw < stopProfit || ((this.buyIn * (1 + this.stopProfit)) < this.max)) {
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
				this.lastTradedDay = day;
				this.resetStopLoss();
			}
		}


		if (!this.isInvested && this.buyNow && investedAllowedByTime) {
			this.marker.push({
				time: (new Date(priceAction.t)).getTime() / 1000 as Time,
				color: '#00FF00',
				shape: 'arrowUp',
				text: `buy @ ${priceAction.vw}`,
				position: 'belowBar'
			})


			if (!this.broker.buy(index, this.symbol, Math.min(this.broker.cash, this.broker.startCash*0.5))) {
				// buy failed
			}


			this.buyIn = priceAction.vw; // TODO multiple buys ???
			this.isInvested = true;
			this.resetStopLoss();
		}

		this.slow.push({
			time: (new Date(priceAction.t)).getTime() / 1000 as Time,
			value: slow
		});

		this.fast.push({
			time: (new Date(priceAction.t)).getTime() / 1000 as Time,
			value: fast
		});



		this.buyNow = false;
	}

	finish(index: number) {
		super.finish(index);
		this.isLong = false;
		this.isInvested = false;
	}

	reset() {
		super.reset();
		this.s = 14;
		this.f = 7;
		this.fast.length = 0;
		this.slow.length = 0;
		this.stock.length = 0;
		this.marker.length = 0;
		this.lastTradedDay = undefined;
		this.resetStopLoss();
	}

	resetStopLoss() {
		this.min = Number.MAX_VALUE;
		this.max = 0;
	}

	tune() {
		this.f = Math.round(Math.random() * 32) + 1;
		this.s = this.f + Math.round(Math.random() * 32) + 1;

		//this.f = 4763 + Math.round(Math.random() * 2 - 1) * 50; // +- 10
		//this.s = 5495 + Math.round(Math.random() * 2 - 1) * 50; // +- 10
		this.startH = 10 + Math.round(Math.random()* 10)
		this.startM = Math.round(Math.random()* 55)
		this.stopProfit = Math.random() * 0.02;
		this.stopLoss = Math.random() * 0.3;
		this.limitProfit = Math.random() * 50;
		this.minPriceVolume = Math.random() * 100_000_000_000;

		// fix
		this.f = 15;
		this.s = 25;

		this.stopLoss = 0.200;
		this.stopProfit = 0.018;

		this.startH = 19;
		//this.startM = 52;
	}
}