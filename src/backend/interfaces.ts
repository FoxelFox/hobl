export interface Asset {
	id: string
	class: string
	exchange: string
	symbol: string
	name: string
	status: string
	tradable: boolean
	marginable: boolean
	maintenance_margin_requirement: number
	margin_requirement_long: number
	margin_requirement_short: number
	shortable: boolean
	easy_to_borrow: boolean
	fractionable: boolean
	attributes: string[]
}

export interface RawPriceAction {
	c: 8.687,
	h: 9.149,
	l: 8.641,
	n: 241419,
	o: 9.124,
	t: "2020-05-26T04:00:00Z",
	v: 817377440,
	vw: 8.817,
}

export interface RawWebsocketPriceAction extends RawPriceAction{
	T: "b",
	S: "QQQ"
}