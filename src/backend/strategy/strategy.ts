import {Broker} from "../broker";

export abstract class Strategy {

	constructor(protected broker: Broker) {

	}

	abstract tick(index: number, priceAction: RawPriceAction)

	abstract tune()
}