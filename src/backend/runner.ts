import {Market} from "./market";
import {Broker} from "./broker";
import {MovingAverage} from "./strategy/moving-average";

export class Runner {
	broker: Broker
	strategy: MovingAverage

	constructor(private market: Market, private symbol: string) {
		this.broker = new Broker(this.market);
		this.strategy = new MovingAverage(symbol, this.broker);
	}

	async init() {
		await this.market.init();
	}

	run() {
		const nvda = this.market.listings[this.symbol];
		const results = [];


		for (let s = 0; s < 100; s += 1 ) {
			for (let f = 0; f < 100; f += 1) {
				for (let sp = 0.01; sp < 0.1; sp += 0.01) {
					let index = 0;
					this.strategy.s = s;
					this.strategy.f = f;
					this.strategy.trailingPStopProfit = sp;
					for (const priceAction of nvda.priceActions) {
						this.strategy.tick(index, priceAction);
						index++;
					}

					this.strategy.finish();
					//if (this.broker.transactions >= 25) {
						// ignore buy and hold results
						//if (this.broker.cash > 100) {
							// only the ones who make profit
							results.push({
								symbol: this.symbol,
								rating: this.broker.cash,
								cash: `${this.broker.cash.toLocaleString('de',{maximumFractionDigits: 2})}`,
								tx: this.broker.transactions,
								fast: this.strategy.f,
								slow: this.strategy.s,
								stop: this.strategy.trailingPStopProfit.toFixed(2)
							});
						//}
					//}

					this.strategy.reset();
				}
			}
		}




		results.sort((a,b) => b.rating - a.rating)
		results.length = Math.min(8, results.length);


		// restart the best setup
		this.strategy.s = results[0].signal;
		this.strategy.f = results[0].macd;
		this.strategy.trailingPStopProfit = results[0].stopProfit;
		// this.strategy.s = 48;
		// this.strategy.m = 98;
		// this.strategy.trailingPStopProfit = 0.006;

		let index = 0;
		for (const priceAction of nvda.priceActions) {
			this.strategy.tick(index, priceAction);
			index++;
		}

		console.table(results, ['symbol', 'cash', 'tx', 'slow', 'fast', 'stop']);
	}
}