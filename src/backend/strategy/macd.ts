import {Strategy} from "./strategy";
import {Broker} from "../broker";
import { TimeValue } from "../../shared/interfaces";


export class Macd extends Strategy {


	signal: TimeValue[] = [];
	macd: { time: string, value: number }[] = [];

	m = 7;
	s = 14;

	constructor(broker: Broker) {
		super(broker);
	}


	tick(priceAction: RawPriceAction) {

		let lastM: number, lastS: number;

		if (this.macd.length) {
			lastM = this.macd.at(-1).value;
			lastS = this.signal.at(-1).value;
		} else {
			lastM = priceAction.o;
			lastS = priceAction.o;
		}

		this.macd.push({
			time: priceAction.t,
			value: (lastM * this.m + priceAction.vw) / (this.m + 1)
		});

		this.signal.push({
			time: priceAction.t,
			value: (lastS * this.s + priceAction.vw) / (this.s + 1)
		});
	}

	tune() {

	}
}