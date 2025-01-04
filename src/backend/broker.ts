import {Market} from "./market";
import {TimeValue} from "../shared/interfaces";

export class Broker {

	readonly startCash = 100;

	cash: number = this.startCash;
	positions: { [symbol: string]: number } = {};
	transactions: number = 0;
	history: TimeValue[] = []

	constructor(private market: Market) {

	}

	buy(index: number, symbol: string, amount: number): boolean {

		if (this.cash < amount) {
			return false;
		}

		const price = this.market.listings[symbol].priceActions[index].vw;
		const shares = amount / price;

		this.positions[symbol] ??= 0;
		this.cash -= amount;
		this.positions[symbol] += shares;

		this.transactions++;

		return true;
	}


	sell(index: number, symbol: string, amount: number): boolean {
		if (this.positions[symbol] < amount) {
			return false;
		}

		const price = this.market.listings[symbol].priceActions[index].vw;

		this.cash += amount * price;
		this.positions[symbol] -= amount;

		this.transactions++;
		this.history.push({
			time: this.market.listings[symbol].priceActions[index].t,
			value: this.cash
		})

		return true;
	}

	sellAllPositions() {
		for (const key in this.positions) {
			const index = this.market.listings[key].priceActions.length -1;
			this.sell(index, key, this.positions[key]);
		}
	}

	reset() {
		this.cash = this.startCash;
		this.transactions = 0;
		for (const key in this.positions) {
			this.positions[key] = 0;
		}
		this.history.length = 0;
	}
}