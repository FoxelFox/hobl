import {Market} from "./market";
import {Broker} from "./broker";
import {Macd} from "./strategy/macd";

export class Runner {
	broker: Broker
	strategy: Macd

	constructor(private market: Market) {
		this.broker = new Broker(this.market);
		this.strategy = new Macd('NVDA', this.broker);
	}

	async init() {
		await this.market.init();
	}

	run() {
		const nvda = this.market.listings['NVDA'];

		let index = 0;
		for (const priceAction of nvda.priceActions) {
			this.strategy.tick(index, priceAction);
		}
		console.log(`Finished NVDA | ${this.broker.cash}`)
	}
}