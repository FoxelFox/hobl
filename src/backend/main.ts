import {Runner} from "./runner";
import {ChartSeries} from "../shared/interfaces"
import {Market} from "./market";

class Backend {

	market = new Market();
	runner = new Runner(this.market, 'QQQ');

	result = () => {

		let charts: ChartSeries[] = [{
			id: 'QQQ',
			lines: [{
				id: 'macd',
				data: this.runner.strategy.slow.slice(-100000),
				color: "#00FF00",
				lineWidth: 1,
				lineStyle: 2,
				axisLabelVisible: false
			}, {
				id: 'signal',
				data: this.runner.strategy.fast.slice(-100000),
				color: "#FFAA00",
				lineWidth: 1,
				lineStyle: 2,
				axisLabelVisible: false
			}],
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
				data: this.market.listings['QQQ'].priceActions.map(e => ({
					time: e.t,
					value: e.vw
				}))
			}]
		}]

		return Response.json(charts);
	}

	router = {
		'/api/charts': this.result
	}

	async main() {
		await this.runner.init();
		this.runner.run();
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
});