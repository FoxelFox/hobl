import {Market} from "./market";
import {Broker} from "./broker";
import {MovingAverage} from "./strategy/moving-average";
import {sum} from "@tensorflow/tfjs";

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

		let max = 0;
		let hasImproved = false;
		let epoch = 0;

		do {
			for (let i = 0; i < 10; ++i) {
				let index = 0;
				this.strategy.tune();

				for (const priceAction of nvda.priceActions) {
					this.strategy.tick(index, priceAction);
					index++;
				}

				this.strategy.finish();
				if (this.broker.transactions >= 4) {
					// ignore buy and hold results
					//if (this.broker.cash > 100) {
					// only the ones who make profit
					results.push({
						symbol: this.symbol,
						rating: (this.broker.cash - 100) / (this.broker.transactions / 2),
						//rating: (this.broker.cash - 100),
						cash: `${this.broker.cash.toLocaleString('de', {maximumFractionDigits: 2})}`,
						tx: this.broker.transactions,
						fast: this.strategy.f,
						slow: this.strategy.s,
						stopProfit: this.strategy.stopProfit,
						stopLoss: this.strategy.stopLoss,
						volume: this.strategy.minPriceVolume
					});
					//}
				}

				this.strategy.reset();
			}

			results.sort((a, b) => (b.rating - a.rating))
			results.length = Math.min(10, results.length);

			let sum = 0;
			for (let x of results) {
				sum += x.rating;
			}

			hasImproved = max < sum;
			max = Math.max(max, sum);

			console.clear();
			console.log(`epoch ${epoch++}`)
			console.table(results, ['symbol', 'cash', 'tx', 'slow', 'fast', 'stopLoss', 'stopProfit', 'rating', 'volume']);
			//} while (hasImproved || max <= 0);
		}while (hasImproved || max <= 0);


		console.log("Done")

		// restart the best setup
		this.strategy.s = results[0].slow;
		this.strategy.f = results[0].fast;
		this.strategy.stopLoss = results[0].stopLoss;
		this.strategy.stopProfit = results[0].stopProfit;
		this.strategy.minPriceVolume = results[0].volume;

		// this.strategy.s = 48;
		// this.strategy.m = 98;
		// this.strategy.trailingPStopProfit = 0.006;

		let index = 0;
		for (const priceAction of nvda.priceActions) {
			this.strategy.tick(index, priceAction);
			index++;
		}
	}
}