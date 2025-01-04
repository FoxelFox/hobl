import {Market} from "./market";
import {TimeValue} from "../shared/interfaces";

export class Broker {

	readonly startCash = 100;

	cash: number = this.startCash;
	positions: { [symbol: string]: number } = {};
	transactions: number = 0;
	history: TimeValue[] = []
	leverage: number = 2;

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
		if (this.positions[symbol] < amount || amount === 0) {
			return false;
		}

		const price = this.market.listings[symbol].priceActions[index].vw;

		const fiat = amount * price;

		const last = this.history.at(-1);
		if (last) {
			this.cash += last.value + (fiat - last.value) * this.leverage;
		} else {
			this.cash += fiat;
		}


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