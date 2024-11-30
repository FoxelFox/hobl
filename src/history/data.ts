import { Price } from "../api";
import { Time } from "lightweight-charts";

export async function load(symbol: string) {
    const res = await fetch(`data/${symbol}.csv`);
    const csv = await res.text();

    const lines = csv.split('\n');
    const length = lines.length;

    const days: {[key: string]: Price[]} = {};

    let nvda_split_skip = true;

    for (let i = 1; i < length; ++i) {
        const line = lines[i].split(",");
        if (line[1]) {
            const day: string = line[1].split(" ")[0];

            //if ( day === "2024-06-10") {
            if ( day === "2024-11-18") {
            //if ( day === "2024-11-22") {
                nvda_split_skip = false;
            }

            if (nvda_split_skip) {
                continue;
            }

            if (!days[day]) {
                days[day] = []
            }

            days[day].push({
                time: (new Date(line[1])).getTime() / 1000 as Time,
                open: parseFloat(line[2]),
                high: parseFloat(line[3]),
                low: parseFloat(line[4]),
                close: parseFloat(line[5]),
                value: parseFloat(line[6])
            });
        }
    }

    return days;
}

export function averagePrices(days: {[day: string]:  Price[]}) {
    const normalizedDays: {[day: string]:  number[]} = {};

    for (const day in days) {
        normalizedDays[day] = [];

        for (const price of days[day]) {
            normalizedDays[day].push((price.low + price.high) / 2);
        }
    }
    return normalizedDays;
}