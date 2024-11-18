import {Chart} from "./chart.ts";
import {Api} from "./api.ts";

new Chart();
const api = new Api();
await api.login();

