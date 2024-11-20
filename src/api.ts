import {Time} from "npm:lightweight-charts@4.2.1";

export interface Price {
    time: Time
    open: number
    high: number
    low: number
    close: number
    value: number // volume
}

export interface Data {
    [key: string]: Price[]
}

export class Api {

    listner: ((update: Data) => void)[] = [];
    db: Data = {};

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
                bars:["NVDA", "PLTR", "AAPL", "GOOG", "AMZN", "META", "TSLA", "TSM", "AMD"],
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            const priceDatas: {[key:string]: Price[]} = {};

            // {"T":"b","S":"PLTR","o":61.9,"h":61.92,"l":61.88,"c":61.88,"v":821,"t":"2024-11-19T19:41:00Z","n":10,"vw":61.901923}
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
}