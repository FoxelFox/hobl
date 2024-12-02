import {AlpacaApi} from "./alpacaApi";


async function main() {
    const api = new AlpacaApi();
    await api.init();
    await api.getBars(null)


    Bun.serve({
        async fetch(req) {

            let path = new URL(req.url).pathname;
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
}

main().then(() => console.log("Done"));