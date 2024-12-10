import {Market} from "./market";

export class Broker {

	cash: number
	positions: { [symbol: string]: number } = {};

	constructor(private market: Market) {

	}

	buy(symbol: string, amount: number) {

	}

	sell(symbol: string, amount: number) {

	}
}