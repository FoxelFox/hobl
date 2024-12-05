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

        await this.getSymbols();

        const data = await this.alpaca.getMultiBarsV2(
            ["NVDA"],
            {
                start: "2022-09-01",
                end: "2022-09-07",
                timeframe: this.alpaca.newTimeframe(1, this.alpaca.timeframeUnit.DAY)
            });
    }

    async getSymbols(): Promise<Asset[]> {

        const res = await (await fetch(
            `https://paper-api.alpaca.markets/v2/assets`, {
                headers: new Headers({
                    "APCA-API-KEY-ID": this.auth.key,
                    "APCA-API-SECRET-KEY": this.auth.secret,
                    "accept": "application/json"
                })
            })).json();

        return res.filter((item) => item.exchange === "NASDAQ");
    }
}