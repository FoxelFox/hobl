import {Api, Data} from "./api.ts";
import {Chart} from "./chart.ts";

export class ChartList {

    charts: {[key: string]: Chart} = {};

    constructor(private api: Api) {
        this.api.subscribe((data) => {
            for(const symbol in data) {
                if (!this.charts[symbol]) {
                    document.getElementById("charts")!.insertAdjacentHTML("beforeend",
                        `<div id="${symbol}" style="width: calc(100vw /3); height: 100px"></div>`
                    );
                    this.charts[symbol] = new Chart(symbol);
                }

                this.charts[symbol].update(data[symbol]);
            }
        });
    }
}