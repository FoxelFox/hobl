export class AlpacaApi {

	auth: {
		key: string
		secret: string
	}


	async init() {
		this.auth = await Bun.file("auth.json").json();

	}

	async getPriceAction(symbol: string): Promise<RawPriceAction[]> {

		const url = [
			`https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}`,
			`timeframe=1Min`,
			`start=2024-12-01`,
			`limit=10000`,
			`adjustment=all`,
			`feed=sip`,
			`sort=asc`
		].join("&");

		const res = await (await fetch(
			url, {
				headers: new Headers({
					"APCA-API-KEY-ID": this.auth.key,
					"APCA-API-SECRET-KEY": this.auth.secret,
					"accept": "application/json"
				})
			})).json();

		return res.bars[symbol]
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

		return res;
	}
}