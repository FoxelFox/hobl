import {Api} from "./api";
import {Chart} from "./chart";
import {LstmModel} from "./lstm-model";
import {ChartSeries, TimeValue} from "./shared/interfaces";
import {data} from "@tensorflow/tfjs";

export class ChartList {

	charts: { [key: string]: Chart } = {};
	models: { [key: string]: LstmModel } = {};

	constructor(private api: Api) {
		this.debug().then()
	}

	async debug() {
		const charts = await this.api.getCharts();

		for (const chart of charts) {
			await this.createChart(chart);
		}

		const socket = new WebSocket(`ws://${location.hostname}:3001`);

		socket.addEventListener("message", event => {
			const update: ChartSeries[] = JSON.parse(event.data);

			for (const chart of update) {
				this.charts[chart.id].update(chart);
			}


		});
	}

	async createChart(data: ChartSeries) {
		if (!this.charts[data.id]) {
			document.getElementById("charts")!.insertAdjacentHTML("beforeend",
				`<div id="${data.id}" style="height: 776px"></div>`
			);
			this.charts[data.id] = new Chart(data.id, data);
		}
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