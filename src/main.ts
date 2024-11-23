import {Api, Price} from "./api.ts";
import {ChartList} from "./chart-list.ts";

const api = new Api();
const charts = new ChartList(api);

//await api.login();
api.fake();


