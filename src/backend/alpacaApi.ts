import {EventSystem} from "../shared/event-system";
import {inject} from "../shared/injector";
import {Asset, RawPriceAction, RawWebsocketPriceAction} from "./interfaces";

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

	eventSystem = inject(EventSystem);

	async init() {
		this.auth = await Bun.file("auth.json").json();
		//this.login();
	}

	login() {
		const ws = new WebSocket("wss://stream.data.alpaca.markets/v2/iex");
		ws.onopen = () => {
			ws.send(JSON.stringify(
				{"action": "auth", "key": this.auth.key, "secret": this.auth.secret},
			));

			ws.send(JSON.stringify({
				action: "subscribe",
				bars: ["QQQ"],
			}));
		};

		ws.onmessage = (message) => {
			console.log(message)
			const data: RawWebsocketPriceAction[] = JSON.parse(message.data)

			if (data[0].T === 'b') {
				for(const entry of data) {
					this.eventSystem.publish('websocket-price-action', entry);
				}

				ws.close(); // needed because the api provider stops sending events after few minutes -.-
			}
		};

		ws.onerror = (error) => {
			console.error('WebSocket Error:', error);
		};

		ws.onclose = () => {
			console.log('connection closed');
			this.login();
		};
	}

	async getPriceAction(symbol: string, timeframe: TimeFrame): Promise<RawPriceAction[]> {

		let bars = await this.loadFromStorage(symbol, timeframe);
		let date: string;

		if (bars.length) {
			date = new Date(new Date(bars.at(-1).t).getTime() + 1000 * 60 * 60 * 24).toISOString().split('T')[0];
		} else {
			date = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 10).toISOString().split('T')[0];
		}

		bars = bars.concat(await this.getPriceActionByDate(symbol, timeframe, date));

		await this.saveToStorage(symbol, timeframe, bars);
		return bars
	}

	async getPriceActionByDate(symbol: string, timeframe: TimeFrame, date: string): Promise<RawPriceAction[]> {
		let bars = [];

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
			if (res.next_page_token) {
				console.log('next request', res.next_page_token);
			}
		} while (res.next_page_token);

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