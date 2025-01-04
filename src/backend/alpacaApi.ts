import {string} from "@tensorflow/tfjs";
import {Time} from "lightweight-charts";

export enum TimeFrame {
	M1 = '1Min',
	M5 = '5Min',
	M15 = '15Min',
	H1 = '1Hour',
	D1 = '1D'
}

export class AlpacaApi {

	auth: {
		key: string
		secret: string
	}


	async init() {
		this.auth = await Bun.file("auth.json").json();

	}

	async getPriceAction(symbol: string, timeframe: TimeFrame): Promise<RawPriceAction[]> {

		let bars = await this.loadFromStorage(symbol, timeframe);
		let date: string;

		if (bars.length) {
			date = new Date(new Date(bars.at(-1).t).getTime() + 1000 * 60 * 60 * 24).toISOString().split('T')[0];
		} else {
			date = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 10).toISOString().split('T')[0];
		}

		const url = [
			`https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}`,
			`timeframe=${timeframe}`,
			`start=${date}`,
			`limit=10000`,
			`adjustment=all`,
			`feed=sip`,
			`sort=asc`
		].join("&");


		let res = {
			next_page_token: undefined,
			bars: undefined
		};

		do {
			res = await (await fetch(
				url + (res.next_page_token ? `&page_token=${res.next_page_token}` : ''), {
					headers: new Headers({
						"APCA-API-KEY-ID": this.auth.key,
						"APCA-API-SECRET-KEY": this.auth.secret,
						"accept": "application/json"
					})
				})).json();
			bars = bars.concat(res.bars[symbol]);
			console.log('fetched', res.next_page_token);
		} while (res.next_page_token);

		await this.saveToStorage(symbol, timeframe, bars);



		// return bars.filter(e => {
		// 	const date = new Date(e.t);
		// 	return (date.getUTCHours() > 14 || date.getUTCHours() === 14 && date.getUTCMinutes() > 30 ) && date.getUTCHours() < 21;
		// });
		return bars
	}

	async getSymbols(): Promise<Asset[]> {

		return await (await fetch(
			`https://paper-api.alpaca.markets/v2/assets`, {
				headers: new Headers({
					"APCA-API-KEY-ID": this.auth.key,
					"APCA-API-SECRET-KEY": this.auth.secret,
					"accept": "application/json"
				})
			})
		).json();
	}

	private async loadFromStorage(symbol: string, timeframe: TimeFrame): Promise<RawPriceAction[]> {
		try {
			return await Bun.file(`./data/${symbol}/${timeframe}.json`).json();
		} catch (e) {
			return [];
		}
	}

	private async saveToStorage(symbol: string, timeframe: TimeFrame, bars: RawPriceAction[]) {

		bars = JSON.parse(JSON.stringify(bars));

		const dateToRemove = bars.at(-1).t.split('T')[0];
		let done = false
		while (!done) {
			const bar = bars.pop();
			if (bar.t.split('T')[0] !== dateToRemove) {
				bars.push(bar);
				done = true;
			}
		}

		await Bun.write(`./data/${symbol}/${timeframe}.json`, JSON.stringify(bars));
	}
}