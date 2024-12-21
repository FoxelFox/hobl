import {Runner} from "./runner";
import {ChartSeries} from "../shared/interfaces"
import {Market} from "./market";

console.log("start")

class Backend {

	market = new Market();
	runner = new Runner(this.market, 'NVDA');

	result = () => {

		let charts: ChartSeries = {
			lines: [{
				id: 'macd',
				data: this.runner.strategy.signal,
				color: "#00FF00"
			}, {
				id: 'signal',
				data: this.runner.strategy.macd,
				color: "#FFAA00"
			}],
			candles: [{
				id: 'stock',
				data: this.runner.strategy.stock
			}],
			markers: this.runner.strategy.marker
		}

		return Response.json(charts);
	}

	router = {
		'/api/result': this.result
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