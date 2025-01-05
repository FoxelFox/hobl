import {Time} from "lightweight-charts";
import {Candle, ChartSeries} from "./shared/interfaces";



export interface Data {
	[key: string]: Candle[]
}

export class Api {

	listner: ((update: Data) => void)[] = [];
	db: Data = {};


	onmessage = (event: MessageEvent<any>) => {
		const data = JSON.parse(event.data);

		const priceDatas: { [key: string]: Candle[] } = {};

		for (const entry of data) {
			if (entry.T === "b") { // new bar
				if (!priceDatas[entry.S]) {
					priceDatas[entry.S] = [];
				}

				priceDatas[entry.S].push({
					time: (new Date(entry.t)).getTime() / 1000 as Time,
					open: entry.o,
					high: entry.h,
					low: entry.l,
					close: entry.c,
					value: entry.v
				});
			}
		}

		for (const l of this.listner) {
			l(priceDatas);
		}

		console.log(JSON.stringify(data));
	};


	constructor() {

	}

	async login() {
		const auth = await (await fetch('auth.json')).json();
		const ws = new WebSocket("wss://stream.data.alpaca.markets/v2/iex");
		ws.onopen = () => {
			ws.send(JSON.stringify(
				{"action": "auth", "key": auth.key, "secret": auth.secret},
			));

			ws.send(JSON.stringify({
				action: "subscribe",
				bars: ["NVDA"],
			}));
		};

		ws.onmessage = this.onmessage;

		ws.onerror = (error) => {
			console.error('WebSocket Error:', error);
		};

		ws.onclose = () => {
			console.log('connection closed');
		};
	}

	subscribe(listener: ((update: Data) => void)) {
		this.listner.push(listener);
	}

	fake() {
		this.onmessage({
			data: JSON.stringify([{
				T: "b",
				S: "NVDA",
				o: 141.9,
				h: 141.92,
				l: 141.88,
				c: 141.88,
				v: 821,
				t: "2024-11-22T15:30:00Z",
				n: 10,
				vw: 141.901923
			}])
		} as MessageEvent)
	}

	async getCharts(): Promise<ChartSeries[]> {
		return await (await fetch('api/charts')).json();
	}
}