import {Broker} from "../broker";

export abstract class Strategy {

	constructor(protected broker: Broker) {

	}

	abstract tick(index: number, priceAction: RawPriceAction)

	abstract tune()

	finish(index: number) {
		this.broker.sellAllPositions(index);
	}

	reset() {
		this.broker.reset();
	}
}