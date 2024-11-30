import * as tf from "@tensorflow/tfjs";
import { load, averagePrices } from "./history/data";
import {Time} from "lightweight-charts";

export class LstmModel {
    model;
    minPrice: number;
    maxPrice: number;

    pricesPerDay: {[day: string]: number[]}
    constructor() {
        // Define the LSTM model
        this.model = tf.sequential();
        this.model.add(tf.layers.lstm({ units: 50, inputShape: [10, 1], returnSequences: false }));
        this.model.add(tf.layers.dense({ units: 32 }));
        this.model.add(tf.layers.dense({ units: 1 }));

        // Compile the model
        this.model.compile({
            optimizer: 'adam',
            loss: 'meanSquaredError'
        });
    }

    async load() {
        const days = await load("NVDA");
        this.pricesPerDay = averagePrices(days);
    }

    prepareData(data: number[], sequenceLength: number) {
        const xs: number[][][] = [];
        const ys: number[] = [];

        for (let i = 0; i < data.length - sequenceLength; i++) {
            xs.push(data.slice(i, i + sequenceLength).map(value => [value]));
            ys.push(data[i + sequenceLength]);
        }

        return { xs: tf.tensor3d(xs), ys: tf.tensor2d(ys, [ys.length, 1]) };
    }

    async train() {
        for (const day in this.pricesPerDay) {
            console.log("Train " + day);
            const prices = this.pricesPerDay[day];
            // Normalize the data
            this.minPrice = Math.min(...prices);
            this.maxPrice = Math.max(...prices);
            const normalizedData = prices.map(price => (price - this.minPrice) / (this.maxPrice - this.minPrice));

            const sequenceLength = 10; // Length of each input sequence
            const { xs, ys } = this.prepareData(normalizedData, sequenceLength);

            // Train the model
            await this.model.fit(xs, ys, {
                epochs: 50,
                batchSize: 32,
                shuffle: true
            });
        }
        console.log("Train done");
    }

    predictNextValue(lastSequence: number[]): Promise<number> {
        const inputTensor = tf.tensor3d([lastSequence.map(value => [value])]);
        const predictedValue = this.model.predict(inputTensor) as tf.Tensor;
        return predictedValue.data().then(data => data[0] * (this.maxPrice - this.minPrice) + this.minPrice);
    }

    async predict(lastSequence: number[], futureSteps: number) {
        let predictions = [];
        let currentSequence = lastSequence.slice();

        for (let i = 9; i < futureSteps; i++) {
            const nextValue = await this.predictNextValue(currentSequence);
            predictions.push({
                time: new Date(new Date("2024-11-22 15:30:00+00").getTime() + i*60000).getTime() / 1000 as Time,
                value: nextValue
            })
            currentSequence.shift();
            currentSequence.push(nextValue / (this.maxPrice - this.minPrice) + this.minPrice);
        }

        return predictions;
    }
}