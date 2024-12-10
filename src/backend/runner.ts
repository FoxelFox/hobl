import {Market} from "./market";
import {Broker} from "./broker";
import {Macd} from "./strategy/macd";

export class Runner {
	market = new Market();
	broker = new Broker(this.market);
	strategy = new Macd(this.broker);

	async init() {
		await this.market.init();
	}

	run() {

		console.log("start analyse nvda")
		const nvda = this.market.listings['NVDA'];

		for (const priceAction of nvda.priceActions) {
			this.strategy.tick(priceAction);
		}
		console.log("finished nvda")
	}
}