import {ChartSeries} from "./shared/interfaces";

export class Api {
	constructor() {

	}

	async getCharts(): Promise<ChartSeries[]> {
		return await (await fetch('api/charts')).json();
	}
}