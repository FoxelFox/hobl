import {TimeFrame} from "./backend/alpacaApi";

export const config = {
	leverage: 10,
	txCost: 1,
	startCash: 10000,
	timeFrame: TimeFrame.M15,
	delay: 1,

	// runner
	samples: 5,
	maxEpoch: 5,
	minTX: 50
}