import {Broker} from "../broker";

export abstract class Strategy {

    constructor(private broker: Broker) {

    }

    abstract tick(priceAction: RawPriceAction)
    abstract tune()
}