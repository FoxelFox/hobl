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

        let lastM: number, lastS: number;

        if (this.macd.length) {
            lastM = this.macd.at(-1).data;
            lastS = this.signal.at(-1).data;
        } else {
            lastM = priceAction.o;
            lastS = priceAction.o;
        }

        this.macd.push({
            time: priceAction.t,
            data: (lastM * this.m + priceAction.vw) / (this.m + 1)
        });

        this.signal.push({
            time: priceAction.t,
            data: (lastS * this.s + priceAction.vw) / (this.s + 1)
        });
    }

    tune() {

    }
}