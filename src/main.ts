import {Chart} from "./chart.ts";
import {Api} from "./api.ts";

const api = new Api();
new Chart(api);

await api.login();

