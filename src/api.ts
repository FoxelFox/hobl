export class Api {
    constructor() {

    }

    async login() {
        const auth = await (await fetch('auth.json')).json();
        const ws = new WebSocket("wss://stream.data.alpaca.markets/v2/iex");
        ws.onopen = () => {
            ws.send(JSON.stringify(
                {"action": "auth", "key": auth.key, "secret": auth.secret},
            ));

            ws.send(JSON.stringify(

                {
                    action: "subscribe",
                    bars:["PLTR"],
                }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(JSON.stringify(data));
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        ws.onclose = () => {
            console.log('connection closed');
        };
    }
}