import {Api} from "./api";
import {Chart} from "./chart";
import {LstmModel} from "./lstm-model";
import {ChartSeries, TimeValue} from "./shared/interfaces";

export class ChartList {

	charts: { [key: string]: Chart } = {};
	models: { [key: string]: LstmModel } = {};

	constructor(private api: Api) {
		this.debug().then()
	}

	async debug() {
		const nvda = await this.api.getSymbol("NVDA");

		await this.createChart("NVDA", nvda);
	}

	async createChart(symbol: string, data: ChartSeries) {
		if (!this.charts[symbol]) {
			document.getElementById("charts")!.insertAdjacentHTML("beforeend",
				`<div id="${symbol}" style="height: 384px"></div>`
			);
			this.charts[symbol] = new Chart(symbol, data);
		}

		this.charts[symbol].update(data[symbol]);

	}

	// watch() {
	// 	this.api.subscribe(async (data) => {
	// 		for (const symbol in data) {
	// 			if (!this.charts[symbol]) {
	// 				document.getElementById("charts")!.insertAdjacentHTML("beforeend",
	// 					`<div id="${symbol}" style="height: 384px"></div>`
	// 				);
	// 				this.charts[symbol] = new Chart(symbol);
	//
	// 				this.models[symbol] = new LstmModel();
	// 				await this.models[symbol].load();
	// 				await this.models[symbol].train();
	// 			}
	//
	// 			this.charts[symbol].update(data[symbol]);
	//
	//
	//
	// 		}
	// 	});
	// }

}