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

		let max = Number.MIN_VALUE;
		let hasImproved = false;
		let epoch = 0;

		do {
			for (let i = 0; i < 25; ++i) {
				let index = 0;
				this.strategy.tune();

				for (const priceAction of nvda.priceActions) {
					this.strategy.tick(index, priceAction);
					index++;
				}

				this.strategy.finish();
				if (this.broker.transactions >= 1000) {
					// ignore buy and hold results
					//if (this.broker.cash > 100) {
					// only the ones who make profit
					results.push({
						symbol: this.symbol,
						rating: (this.broker.cash - this.broker.startCash) / (this.broker.transactions / 2),
						//rating: (this.broker.cash - this.broker.startCash),
						cash: `${this.broker.cash.toLocaleString('de', {maximumFractionDigits: 2})}`,
						tx: this.broker.transactions,
						fast: this.strategy.f,
						slow: this.strategy.s,
						stopProfit: this.strategy.stopProfit,
						stopLoss: this.strategy.stopLoss,
						volume: this.strategy.minPriceVolume,
						SM: this.strategy.startM,
						SH: this.strategy.startH
					});
					//}
				}

				this.strategy.reset();
			}

			results.sort((a, b) => (b.rating - a.rating))
			results.length = Math.min(25, results.length);

			let sum = 0;
			for (let x of results) {
				sum += x.rating;
			}

			hasImproved = max < sum;
			max = Math.max(max, sum);


			const formatedResult = results.map(e => ({
				symbol: e.symbol,
				rating: e.rating.toFixed(2),
				cash: e.cash,
				tx: e.tx.toString(),
				fast: e.fast.toString(),
				slow: e.slow.toString(),
				stopProfit: e.stopProfit.toFixed(3),
				stopLoss: e.stopLoss.toFixed(3),
				volume: e.volume,
				SH: e.SH,
				SM: e.SM
			}));

			console.clear();
			console.log(`epoch ${epoch++}`)
			console.table(formatedResult, ['symbol', 'cash', 'tx', 'slow', 'fast', 'stopLoss', 'stopProfit', 'SH', 'SM', 'rating']);
			console.log(hasImproved,max)
		}while (hasImproved || max < 1);


		console.log("Done", max)

		// restart the best setup
		this.strategy.s = results[0].slow;
		this.strategy.f = results[0].fast;
		this.strategy.stopLoss = results[0].stopLoss;
		this.strategy.stopProfit = results[0].stopProfit;
		this.strategy.minPriceVolume = results[0].volume;
		this.strategy.startH = results[0].SH;
		this.strategy.startM = results[0].SM;

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