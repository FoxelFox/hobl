interface Asset {
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