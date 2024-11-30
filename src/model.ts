import * as tf  from "@tensorflow/tfjs"
import {load, averagePrices} from "./history/data";
import {Price} from "./api";
import { Time } from "lightweight-charts";

export class Model {

    model;
    minPrice: number;
    maxPrice: number;


    pricesPerDay: {[day: string]:  number[]}

    constructor() {
        // Define the model
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [1] }));
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

    async train () {

        for (const day in this.pricesPerDay) {
            console.log("Train " + day)
            const prices = this.pricesPerDay[day];

            // Normalize the data
            this.minPrice = Math.min(...prices);
            this.maxPrice = Math.max(...prices);
            const normalizedData = prices.map(price => (price - this.minPrice) / (this.maxPrice - this.minPrice));

            // Prepare training and test datasets
            const splitIndex = Math.floor(normalizedData.length * 0.8);
            const trainData = normalizedData.slice(0, splitIndex);
            const testData = normalizedData.slice(splitIndex);

            // Create a tensor from the data
            const xsTrain = tf.tensor2d(trainData.map((_, i) => [i]), [trainData.length, 1]);
            const ysTrain = tf.tensor2d(trainData, [trainData.length, 1]);

            const xsTest = tf.tensor2d(testData.map((_, i) => [splitIndex + i]), [testData.length, 1]);
            const ysTest = tf.tensor2d(testData, [testData.length, 1]);

            // Train the model
            await this.model.fit(xsTrain, ysTrain, {
                epochs: 50,
                validationData: [xsTest, ysTest]
            });
        }
    }



    predict() {

        const predictions = []

        for (let i = 0; i < 390; i++) {
            // Predict future prices

            const predictionTensor = tf.tensor2d([[i]]);
            const predictedValue = this.model.predict(predictionTensor) as tf.Tensor;

            // Denormalize the predicted value
            const predictedPrice = (predictedValue.dataSync()[0] * (this.maxPrice - this.minPrice)) + this.minPrice;

            predictions.push({
                time: new Date(new Date("2024-11-22 15:30:00+00").getTime() + i*60000).getTime() / 1000 as Time,
                value: predictedPrice
            })
        }

        return predictions;
    }
}
