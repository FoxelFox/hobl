import {Market} from "./market";
import {Broker} from "./broker";
import {MovingAverage} from "./strategy/moving-average";
import {EventSystem} from "../shared/event-system";
import {inject} from "../shared/injector";
import {config} from "../config";

export class Runner {
	broker: Broker
	strategy: MovingAverage
	eventSystem = inject(EventSystem);

	constructor(private market: Market, private symbol: string) {
		this.broker = new Broker(this.market);
		this.strategy = new MovingAverage(symbol, this.broker);
	}

	async init() {
		await this.market.init();
	}


	train() {
		const listing = this.market.listings[this.symbol];
		const results = [];

		let max = Number.MIN_VALUE;
		let hasImproved = false;
		let epoch = 0;


		const skipTraining = false;
		const trainPriceActions = listing.priceActions.slice(0, listing.priceActions.length - 0);

		do {
			for (let i = 0; i < config.samples; ++i) {
				let index = 0;
				this.strategy.tune();

				for (const priceAction of trainPriceActions) {
					this.strategy.tick(index, priceAction);
					index++;
				}

				this.strategy.finish(index -1);
				if (this.broker.transactions >= config.minTX) {
				// 	if (this.broker.cash > this.broker.startCash * minGain) {
						results.push(this.generateResultReport());
					// }
				}

				this.strategy.reset();
			}

			results.sort((a, b) => (b.rating - a.rating))
			results.length = Math.min(config.samples, results.length);


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

			console.log(hasImproved,results.length === 0,isNaN(max))
		}while (!skipTraining && epoch < config.maxEpoch && (hasImproved || results.length === 0 || isNaN(max)));

		console.log("Done", max)

		// restart the best setup
		console.log(this.strategy.marker.length)

		this.strategy.load(results[0]);

		let index = 0;
		for (const priceAction of listing.priceActions) {
			this.strategy.tick(index, priceAction);
			index++;
		}
	}

	logTable(results: Record<string, any>[], epoch?: number) {
		const logs = [];

		for (const result of results) {
			const log = this.strategy.log(result);
			log.symbol = result.symbol;
			log.rating = result.rating.toFixed(2);
			log.cash = result.cash;
			log.tx = result.tx.toString();
			log.win = Math.round(result.win * 100);
			logs.push(log);
		}

		epoch ? console.log(`epoch ${epoch}`): 42
		console.table(logs);
	}

	generateResultReport() {

		const record = {
			symbol: this.symbol,
			//rating: (this.broker.cash - this.broker.startCash) / (this.broker.transactions / 2),
			//rating: (this.broker.cash - this.broker.startCash),
			//rating: this.broker.winRate * this.broker.cash,
			//rating: this.broker.winRate,
			rating: this.broker.winRate * this.broker.cash / this.broker.transactions,
			//rating: (this.broker.winRate / this.broker.transactions) * this.broker.cash,
			cash: `${this.broker.cash.toLocaleString('de', {maximumFractionDigits: 2})}`,
			tx: this.broker.transactions,
			win: this.broker.winRate
		};

		this.strategy.save(record);
		return record;
	}
}