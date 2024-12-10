import {Runner} from "./runner";

console.log("start")

class Backend {

	runner = new Runner();

	result = () => {
		return Response.json({
			macd: this.runner.strategy.macd,
			signal: this.runner.strategy.signal
		});
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

