import {AlpacaApi, TimeFrame} from "./alpacaApi";

export interface Listing {
	asset: Asset
	priceActions: RawPriceAction[]
}

export class Market {

	api: AlpacaApi = new AlpacaApi();
	listings: { [symbol: string]: Listing } = {};

	async init() {
		await this.api.init();
		const assets = await this.api.getSymbols();

		//console.table(assets, ['class', 'exchange', 'symbol', 'name'])

		// first only nvidia
		const nvda = assets.find(e => e.symbol === 'QQQ');


		this.listings[nvda.symbol] = {
			asset: nvda,
			priceActions: await this.api.getPriceAction(nvda.symbol, TimeFrame.M5)
		}
	}
}