import {AlpacaApi, TimeFrame} from "./alpacaApi";
import {EventSystem} from "../shared/event-system";
import { inject } from "../shared/injector";

export interface Listing {
	asset: Asset
	priceActions: RawPriceAction[]
}

export class Market {

	timeFrame = TimeFrame.M1;
	api: AlpacaApi = new AlpacaApi();
	listings: { [symbol: string]: Listing } = {};
	eventSystem = inject(EventSystem);

	async init() {
		await this.api.init();
		const assets = await this.api.getSymbols();

		//console.table(assets, ['class', 'exchange', 'symbol', 'name'])

		// first only nvidia
		const nvda = assets.find(e => e.symbol === 'QQQ');


		this.listings[nvda.symbol] = {
			asset: nvda,
			priceActions: await this.api.getPriceAction(nvda.symbol, this.timeFrame)
		}
	}

	watch() {
		setInterval(async () => {
			for (const key in this.listings) {
				const symbol = this.listings[key].asset.symbol;
				const lastAction = this.listings[symbol].priceActions.at(-1);
				const update = await this.api.getPriceActionByDate(symbol, this.timeFrame, lastAction.t);
				const index = update.findIndex(a => a.t === lastAction.t);
				const newtActions = index === -1 ? [] : update.slice(index + 1);


				for (const action of newtActions) {
					this.listings[symbol].priceActions.push(action);
					this.eventSystem.publish(symbol, {
						index: this.listings[symbol].priceActions.length -1,
						priceAction: action
					});
				}
			}
		}, 1000);
	}
}