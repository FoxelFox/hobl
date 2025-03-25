import {TimeFrame} from "./backend/alpacaApi";

export const config = {
	leverage: 10,
	txCost: 1,
	startCash: 1000,
	timeFrame: TimeFrame.M15,
	delay: 1,

	// runner
	samples: 5,
	maxEpoch: 25,
	minTX: 100
}