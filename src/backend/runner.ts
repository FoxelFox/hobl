import {Market} from "./market";
import {Broker} from "./broker";
import {Macd} from "./strategy/macd";

export class Runner {
	broker: Broker
	strategy: Macd

	constructor(private market: Market, private symbol: string) {
		this.broker = new Broker(this.market);
		this.strategy = new Macd(symbol, this.broker);
	}

	async init() {
		await this.market.init();
	}

	run() {
		const nvda = this.market.listings[this.symbol];
		const results = [];

		for (let n = 0; n < 200000; ++n) {
			let index = 0;
			for (const priceAction of nvda.priceActions) {
				this.strategy.tick(index, priceAction);
				index++;
			}

			this.strategy.finish();
			if (this.broker.transactions >= 4) {
				// ignore buy and hold results
				if (this.broker.cash > 100) {
					// only the ones who make profit
					results.push({
						symbol: "NVDA",
						rating: this.broker.cash,
						cash: `${this.broker.cash.toLocaleString('de',{maximumFractionDigits: 0})}€`,
						tx: this.broker.transactions,
						macd: this.strategy.m,
						signal: this.strategy.s
					});
				}
			}

			this.strategy.reset();
			this.strategy.tune();
		}


		results.sort((a,b) => b.rating - a.rating).length = 10;


		// restart the best setup
		// this.strategy.s = results[0].signal;
		// this.strategy.m = results[0].macd;

		// good buy but bad sell
		// this.strategy.s = 149;
		// this.strategy.m = 150;

		this.strategy.s = 139;
		this.strategy.m = 164;
		let index = 0;
		for (const priceAction of nvda.priceActions) {
			this.strategy.tick(index, priceAction);
			index++;
		}

		console.table(results, ['symbol', 'cash', 'tx', 'macd', 'signal']);
	}
}