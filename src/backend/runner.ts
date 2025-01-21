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
		const listing = this.market.listings[this.symbol];
		const results = [];

		let max = Number.MIN_VALUE;
		let hasImproved = false;
		let epoch = 0;

		const samples = 3;
		const minTX = 1000;
		const minAvgRating = 12000
		const minGain = 0;

		const trainPriceActions = listing.priceActions.slice(0, listing.priceActions.length - 0);

		do {
			for (let i = 0; i < samples; ++i) {
				let index = 0;
				this.strategy.tune();

				for (const priceAction of trainPriceActions) {
					this.strategy.tick(index, priceAction);
					index++;
				}

				this.strategy.finish(index -1);
				if (this.broker.transactions >= minTX) {
					if (this.broker.cash > this.broker.startCash * minGain) {
						results.push(this.generateResultReport());
					}
				}

				this.strategy.reset();
			}

			results.sort((a, b) => (b.rating - a.rating))
			results.length = Math.min(samples, results.length);


			if (results.length > 0) {
				let sum = 0;
				for (let x of results) {
					sum += x.rating;
				}

				const avg = sum / results.length
				hasImproved = max < avg;
				max = Math.max(max, avg);
			}

			epoch++;

			console.clear();
			this.logTable(results, epoch);

			console.log(hasImproved, max < minAvgRating,results.length === 0,isNaN(max))
		}while (hasImproved || max < minAvgRating || results.length === 0 || isNaN(max));

		console.log("Done", max)

		// restart the best setup
		this.strategy.s = results[0].slow;
		this.strategy.f = results[0].fast;
		this.strategy.stopLoss = results[0].stopLoss;
		this.strategy.stopProfit = results[0].stopProfit;
		this.strategy.limitProfit = results[0].limitProfit;
		this.strategy.minPriceVolume = results[0].volume;
		this.strategy.startH = results[0].SH;
		this.strategy.startM = results[0].SM;

		let index = 0;
		for (const priceAction of listing.priceActions) {
			this.strategy.tick(index, priceAction);
			index++;
		}
		this.strategy.finish(index -1);

		this.logTable([this.generateResultReport()]);
	}

	logTable(results, epoch?: number) {
		const formatedResult = results.map(e => ({
			symbol: e.symbol,
			rating: e.rating.toFixed(2),
			cash: e.cash,
			tx: e.tx.toString(),
			fast: e.fast.toString(),
			slow: e.slow.toString(),
			stopProfit: e.stopProfit.toFixed(3),
			stopLoss: e.stopLoss.toFixed(3),
			limitProfit: e.limitProfit.toFixed(3),
			volume: e.volume,
			SH: e.SH,
			SM: e.SM,
			win: Math.round(e.win * 100)
		}));

		epoch ? console.log(`epoch ${epoch}`): 42
		console.table(formatedResult);
	}

	generateResultReport() {
		return {
			symbol: this.symbol,
			//rating: (this.broker.cash - this.broker.startCash) / (this.broker.transactions / 2),
			//rating: (this.broker.cash - this.broker.startCash),
			rating: this.broker.winRate * this.broker.cash,
			//rating: this.broker.winRate,
			cash: `${this.broker.cash.toLocaleString('de', {maximumFractionDigits: 2})}`,
			tx: this.broker.transactions,
			fast: this.strategy.f,
			slow: this.strategy.s,
			stopProfit: this.strategy.stopProfit,
			stopLoss: this.strategy.stopLoss,
			limitProfit: this.strategy.limitProfit,
			volume: this.strategy.minPriceVolume,
			SM: this.strategy.startM,
			SH: this.strategy.startH,
			win: this.broker.winRate
		}
	}
}