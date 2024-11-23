import {Api, Data, Price} from "./api.ts";
import {Chart} from "./chart.ts";
import {Model} from "./model.ts";
import {LstmModel} from "./lstm-model.ts";

export class ChartList {

    charts: {[key: string]: Chart} = {};
    models: {[key: string]: LstmModel} = {};

    constructor(private api: Api) {
        this.api.subscribe(async (data) => {
            for(const symbol in data) {
                if (!this.charts[symbol]) {
                    document.getElementById("charts")!.insertAdjacentHTML("beforeend",
                        `<div id="${symbol}" style="height: 384px"></div>`
                    );
                    this.charts[symbol] = new Chart(symbol);

                    this.models[symbol] = new LstmModel();
                    await this.models[symbol].load();
                    await this.models[symbol].train();
                }

                this.charts[symbol].update(data[symbol]);


                this.charts[symbol].drawPrediction(await this.models[symbol].predict([
                    145.94,
                    145.87,
                    145.85,
                    146.04,
                    146.34,
                    146.65,
                    146.52,
                    146.04,
                    145.60,
                    145.25,
                ], 390 -10));

            }
        });
    }


}