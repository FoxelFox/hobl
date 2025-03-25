import {Market} from "./market";
import {TimeValue} from "../shared/interfaces";
import {Time} from "lightweight-charts";
import {config} from "../config";

export class Broker {

	cash: number = config.startCash;
	positions: { [symbol: string]: number } = {};
	transactions: number = 0;
	history: TimeValue[] = []
	lastCashUsed: number;
	win: number = 0;
	loose: number = 0;
	delay: number = config.delay;

	constructor(private market: Market) {

	}

	buy(index: number, symbol: string, amount: number): boolean {

		const priceActions = this.market.listings[symbol].priceActions;
		const dIndex = Math.min(priceActions.length - 1, index + this.delay);

		if (this.cash < amount + config.txCost || amount < config.txCost) {
			return false;
		}

		const price = priceActions[dIndex].vw;
		const shares = amount / price;

		this.lastCashUsed = amount;
		this.positions[symbol] ??= 0;
		this.cash -= amount;
		this.cash -= config.txCost;
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

		const priceActions = this.market.listings[symbol].priceActions;
		const dIndex = Math.min(priceActions.length - 1, index + this.delay);
		const price = priceActions[dIndex].vw;

		const fiat = amount * price;

		if (this.lastCashUsed) {
			const performance = this.lastCashUsed + (fiat - this.lastCashUsed) * config.leverage;
			this.cash += performance;
			this.cash -= config.txCost;
			if (this.lastCashUsed < (performance - config.txCost * 2)) {
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
		this.cash = config.startCash;
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