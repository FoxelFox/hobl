import {Strategy} from "./strategy";
import {Broker} from "../broker";

export class Macd extends Strategy {


    signal: {time: string, data: number}[] = [];
    macd: {time: string, data: number}[] = [];

    m = 7;
    s = 14;

    constructor(broker: Broker) {
        super(broker);
    }


    tick(priceAction: RawPriceAction) {
        this.macd.push({
            time: priceAction.t,
            data: (this.macd.at(-1).data * this.m + priceAction.vw) / (this.m + 1)
        });

        this.signal.push({
            time: priceAction.t,
            data: (this.signal.at(-1).data * this.s + priceAction.vw) / (this.s + 1)
        });
    }

    tune() {

    }
}