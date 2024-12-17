import {Market} from "./market";

export class Broker {

	cash: number = 1000;
	positions: { [symbol: string]: number } = {};

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

		console.log(`B ${shares.toFixed(2)}x${symbol}@${price.toFixed(2)}`)

		return true;
	}


	sell(index: number, symbol: string, amount: number): boolean {
		if (this.positions[symbol] < amount) {
			return false;
		}

		const price = this.market.listings[symbol].priceActions[index].vw;

		this.cash += amount * price;
		this.positions[symbol] += amount;

		console.log(`S ${amount.toFixed(2)}x${symbol}@${price.toFixed(2)}`)

		return true;
	}
}