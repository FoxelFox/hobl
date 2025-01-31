import {Runner} from "./runner";
import {ChartSeries} from "../shared/interfaces"
import {Market} from "./market";
import {EventSystem} from "../shared/event-system";
import {data} from "@tensorflow/tfjs";
import * as Buffer from "node:buffer";
import {inject} from "../shared/injector";


const SYMBOL = 'QQQ'

class Backend {

	eventSystem = new EventSystem();
	market = new Market();

	runner = new Runner(this.market, SYMBOL);

	result = () => {
		let charts: ChartSeries[] = [{
			id: SYMBOL,
			lines: [
				// {
				// 	id: 'macd',
				// 	data: this.runner.strategy.slow.slice(-100000),
				// 	color: "#00FF00",
				// 	lineWidth: 1,
				// 	lineStyle: 2,
				// 	axisLabelVisible: false
				// },
				// {
				// 	id: 'signal',
				// 	data: this.runner.strategy.fast.slice(-100000),
				// 	color: "#FFAA00",
				// 	lineWidth: 1,
				// 	lineStyle: 2,
				// 	axisLabelVisible: false
				// },
				{
					id: 'stopLoss',
					data: this.runner.strategy.stopLossLine.slice(-100000),
					color: "#AA0000",
					lineWidth: 2,
					lineStyle: 1,
					axisLabelVisible: false
				},
				{
					id: 'stopProfit',
					data: this.runner.strategy.stopProfitLine.slice(-100000),
					color: "#00AA00",
					lineWidth: 2,
					lineStyle: 1,
					axisLabelVisible: false
				}
			],
			candles: [{
				id: 'stock',
				data: this.runner.strategy.stock.slice(-100000)
			}],
			markers: this.runner.strategy.marker.slice(-100)
		}, {
			id: 'cash',
			areas: [{
				id: 'cash',
				data: this.runner.broker.history
			}],
			lines: [{
				id: 'stock',
				color: '#FFFFFF',
				lineWidth: 1,
				lineStyle: 1,
				data: this.market.listings[SYMBOL].priceActions.map(e => ({
					time: e.t,
					value: e.vw
				}))
			}]
		}]

		return Response.json(charts);
	};

	websocket = () => {

	};

	router = {
		'/api/charts': this.result,
		'/websocket': this.websocket
	}

	async main() {
		await this.runner.init();
		this.runner.train();
	}
}


const backed = new Backend();

backed.main().then(() => {
	Bun.serve({
		async fetch(req) {

			let path = new URL(req.url).pathname;

			let p = path.split('/');
			if (p[1] === "api") {
				return backed.router[path]();
			}


			if (path === "/") {
				path = "index.html";
			} else {
				path = "." + path;
			}
			const file = Bun.file(path);

			if (await file.exists()) {
				return new Response(file);
			} else {
				return new Response("404!")
			}

		},
	});

	const webSocketServer = Bun.serve({
		port: 3001,
		async fetch(req, server) {
			// upgrade the request to a WebSocket
			if (server.upgrade(req)) {
				return; // do not return a Response
			}
			return new Response("Upgrade failed", { status: 500 });
		},
		websocket: {
			open(ws) {
				ws.subscribe('chart-update');
			},
			message(ws, message) {

			},
			close(ws, code: number, reason: string) {
				ws.unsubscribe('chart-update');
			}
		}
	});

	const eventSystem = inject(EventSystem);

	eventSystem.register("chart-update", (data) => {
		webSocketServer.publish("chart-update", JSON.stringify(data));
	});

	backed.market.watch();

	console.log("Online")
});