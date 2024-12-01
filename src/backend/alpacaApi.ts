import Alpaca from "@alpacahq/alpaca-trade-api";

export class AlpacaApi {

    auth: {
        key: string
        secret: string
    }

    alpaca: Alpaca

    async init() {
        this.auth = await Bun.file("auth.json").json();
        this.alpaca = new Alpaca({
            keyId: this.auth.key,
            secretKey: this.auth.secret,
        });
    }

    async getBars(symbol:string) {
        const data = await this.alpaca.getCryptoBars(
            ["BTC/USD"],
            {
                start: "2022-09-01",
                end: "2022-09-07",
                timeframe: this.alpaca.newTimeframe(1, this.alpaca.timeframeUnit.DAY)
            });
        console.log(data);
    }
}