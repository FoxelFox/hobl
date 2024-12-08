import {Runner} from "./runner";

console.log("start")

class Backend {

    runner = new Runner();
    router = {
        'api/result': this.result
    }

    async main() {
        await this.runner.init();
        this.runner.run();
    }

    result() {
        return Response.json({
            macd: this.runner.strategy.macd,
            signal: this.runner.strategy.signal
        });
    }
}


const backed = new Backend();

backed.main().then(() => {
    Bun.serve({
        async fetch(req) {

            let path = new URL(req.url).pathname;

            let p = path.split('/');
            if (p[0] === "api") {
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

