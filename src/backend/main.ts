import {Runner} from "./runner";
import {ChartSeries} from "../shared/interfaces"

console.log("start")

class Backend {

	runner = new Runner();

	result = () => {

		let charts: ChartSeries = {
			areas: [{
				id: 'macd',
				data: this.runner.strategy.macd
			}, {
				id: 'signal',
				data: this.runner.strategy.signal
			}]
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