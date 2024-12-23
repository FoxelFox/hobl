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



		for (let s = 0; s < 20; s += 0.1 ) {
			for (let m = 0; m < 20; m += 0.1) {
				let index = 0;
				this.strategy.s = s;
				this.strategy.m = m;
				for (const priceAction of nvda.priceActions) {
					this.strategy.tick(index, priceAction);
					index++;
				}

				this.strategy.finish();
				if (this.broker.transactions >= 25) {
					// ignore buy and hold results
					//if (this.broker.cash > 100) {
						// only the ones who make profit
						results.push({
							symbol: this.symbol,
							rating: this.broker.cash,
							cash: `${this.broker.cash.toLocaleString('de',{maximumFractionDigits: 0})}€`,
							tx: this.broker.transactions,
							macd: this.strategy.m,
							signal: this.strategy.s
						});
					//}
				}

				this.strategy.reset();
			}
		}





		results
			.sort((a,b) => b.rating - a.rating)
			.sort((a,b) => a.tx - b.tx)
			.length = 25;


		// restart the best setup
		this.strategy.s = results[0].signal;
		this.strategy.m = results[0].macd;

		let index = 0;
		for (const priceAction of nvda.priceActions) {
			this.strategy.tick(index, priceAction);
			index++;
		}

		console.table(results, ['symbol', 'cash', 'tx', 'macd', 'signal']);
	}
}