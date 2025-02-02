import {Market} from "./market";
import {TimeValue} from "../shared/interfaces";
import {Time} from "lightweight-charts";

export class Broker {

	readonly startCash = 2000;

	cash: number = this.startCash;
	positions: { [symbol: string]: number } = {};
	transactions: number = 0;
	history: TimeValue[] = []
	leverage: number = 3;
	txCost: number = 1;
	lastCashUsed: number;
	win: number = 0;
	loose: number = 0;

	constructor(private market: Market) {

	}

	buy(index: number, symbol: string, amount: number): boolean {

		if (this.cash < amount + this.txCost || amount < this.txCost) {
			return false;
		}

		const price = this.market.listings[symbol].priceActions[index].vw;
		const shares = amount / price;

		this.lastCashUsed = amount;
		this.positions[symbol] ??= 0;
		this.cash -= amount;
		this.cash -= this.txCost;
		this.positions[symbol] += shares;

		this.transactions++;

		if (this.cash < 0 || this.positions[symbol] < 0) {
			console.log('error buy', this.cash)
		}

		return true;
	}


	sell(index: number, symbol: string, amount: number): boolean {
		if (this.positions[symbol] < amount || !amount) {
			return false;
		}

		const price = this.market.listings[symbol].priceActions[index].vw;

		const fiat = amount * price;

		if (this.lastCashUsed) {
			const performance = this.lastCashUsed + (fiat - this.lastCashUsed) * this.leverage;
			this.cash += performance;
			this.cash -= this.txCost;
			if (this.lastCashUsed < performance) {
				this.win++;
			} else {
				this.loose++;
			}
		} else {
			console.log("ERROR", amount)
			this.cash += fiat;
		}

		if (this.cash < 0) {
			this.cash = 0;
			// Fuck
		}


		this.positions[symbol] -= amount;

		if (this.positions[symbol] < 0) {
			console.log("error")
		}

		this.transactions++;
		this.history.push({
			time:  (new Date(this.market.listings[symbol].priceActions[index].t)).getTime() / 1000 as Time,
			value: this.cash
		})

		return true;
	}

	sellAllPositions(index: number) {
		for (const key in this.positions) {
			this.sell(index, key, this.positions[key]);
		}
	}

	reset() {
		this.cash = this.startCash;
		this.win = 0;
		this.loose = 0;
		this.transactions = 0;
		this.lastCashUsed = undefined;
		for (const key in this.positions) {
			this.positions[key] = 0;
		}
		this.history.length = 0;
	}

	get winRate() {
		return this.win / (this.win + this.loose);
	}
}