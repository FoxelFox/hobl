import {Broker} from "../broker";
import {RawPriceAction} from "../interfaces";

export abstract class Strategy {

	protected constructor(protected broker: Broker) {
	}

	finish(index: number) {
		this.broker.sellAllPositions(index);
	}

	reset() {
		this.broker.reset();
	}

	abstract tick(index: number, priceAction: RawPriceAction): void

	abstract tune(): void

	abstract save(config: Record<string, any>): void

	abstract load(config: Record<string, any>): void

	abstract log(config: Record<string, any>): void
}